import { Request } from "express";
import passport from "passport";
import {
  Strategy as GoogleStrategy,
  Profile,
  VerifyCallback,
} from "passport-google-oauth20";
import prisma from "../utils/dbconnect";
import { Role } from "@prisma/client";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../modules/auth/auth.controller";

const callbackUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000/api/auth/google/callback"
    : process.env.CALLBACK_URL!;
const googleClientId = process.env.CLIENT_ID;
const googleClientSecret = process.env.CLIENT_SECRET;

if (googleClientId && googleClientSecret && callbackUrl) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: googleClientId,
        clientSecret: googleClientSecret,
        callbackURL: callbackUrl,
        passReqToCallback: true,
      },
      async (
        request: Request,
        accessToken: string,
        refreshToken: string,
        profile: Profile,
        done: VerifyCallback,
      ) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error("no email from google"), undefined);
          }

          let user = await prisma.user.findUnique({
            where: { email },
          });
          if (!user) {
            user = await prisma.user.create({
              data: {
                email,
                name: profile.displayName,
                password: "",
                role: Role.USER,
                isEmailVerified: true,
              },
            });
          }
          const accessToken = generateAccessToken(user.id, user.role);
          const refreshToken = generateRefreshToken(user.id, user.role);
          return done(null, {
            user,
            accessToken: accessToken,
            refreshToken: refreshToken,
          });
        } catch (error) {
          return done(error as Error, undefined);
        }
      },
    ),
  );
} else {
  console.warn(
    "[Auth] Google OAuth is disabled. Missing CLIENT_ID, CLIENT_SECRET, or CALLBACK_URL.",
  );
}

export default passport;
