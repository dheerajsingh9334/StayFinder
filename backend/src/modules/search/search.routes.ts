import { Router } from "express";
import SearchController from "./search.controller";

const searchRouter = Router();

searchRouter.get("/property", SearchController.searchProperty);

export default searchRouter;
