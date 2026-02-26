import { Router } from "express";
import SearchController from "./search.controller";

const searchRouter = Router();

searchRouter.get("/", SearchController.searchProperty);

searchRouter.post("/aisearch", SearchController.aiSearch);
export default searchRouter;
