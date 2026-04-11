import { Request } from "express";
import passport from "passport";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
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
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID!,
      clientSecret: process.env.CLIENT_SECRET!,
      callbackURL: callbackUrl,
      passReqToCallback: true,
    },
    async (
      request: Request,
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done,
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
        return done(Error, undefined);
      }
    },
  ),
);

export default passport;
