import { fields } from "./../../client/node_modules/@hookform/resolvers/ajv/src/__tests__/__fixtures__/data";
import request from "supertest";
import app from "../server";
import { beforeAll, describe, expect, it } from "@jest/globals";

process.env.NODE_ENV = "test";
var refresh_token: string;

var postId: string, accessToken: string;

const post = {
    title: "Test Post",
    ingredients: [
        {
            name: "Test Ingredient",
            amount: "1 cup",
            ingredient: [],
        },
    ],
    instructions: [
        {
            title: "Test Instruction",
            steps: ["Step 1", "Step 2"],
        },
    ],
};

const noID = "6752d2e24222f986649b5809";

describe("posts test", () => {
    it("should return 400 if invalid input - create post", async () => {
        const res = await request(app)
            .post("/api/post")
            .set("Authorization", `Bearer ${global.TestAccessToken}`)
            .field("instructions", JSON.stringify(post.instructions))
            .field("ingredients", JSON.stringify(post.ingredients));

        expect(res.statusCode).toEqual(400);
    });

    it("should return 201 if post created successfully - create post", async () => {
        const res = await request(app)
            .post("/api/post")
            .set("Authorization", `Bearer ${global.TestAccessToken}`)
            .field("title", post.title)
            .field("instructions", JSON.stringify(post.instructions))
            .field("ingredients", JSON.stringify(post.ingredients));

        //console.log(res.body);

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty("post");
        expect(res.body.post).toHaveProperty("_id");
        expect(res.body.post.title).toEqual(post.title);
        postId = res.body.post._id;
    });

    it("should return 200 if returned posts - get feed posts", async () => {
        const res = await request(app)
            .get(`/api/post/`)
            .set("Authorization", `Bearer ${global.TestAccessToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("posts");
        expect(res.body.posts).toBeInstanceOf(Array);
    });

    it("should return 200 if returned posts - get user posts", async () => {
        const res = await request(app)
            .get(`/api/post/${global.TestUserId}`)
            .set("Authorization", `Bearer ${global.TestAccessToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("posts");
        expect(res.body.posts).toBeInstanceOf(Array);
    });
    /*
    it("should return 404 if returned posts - post not found", async () => {
        const res = await request(app)
            .put(`/api/post/${noID}`)
            .set("Authorization", `Bearer ${global.TestAccessToken}`)

        expect(res.statusCode).toEqual(404);
    });
*/
    it("should return 200 if returned posts - updatedPost", async () => {
        const res = await request(app)
            .put(`/api/post/${postId}`)
            .set("Authorization", `Bearer ${global.TestAccessToken}`);

        expect(res.statusCode).toEqual(200);
    });

    
    it("should return 404 if the Post not exist", async () => {
        const res = await request(app)
            .post(`/api/post/${noID}/like`)
            .set("Authorization", `Bearer ${global.TestAccessToken}`);

        console.log(res.body);
        expect(res.statusCode).toEqual(404);
    });
    

    it("should return 200 if the pose was like successfully", async () => {
        const res = await request(app)
            .post(`/api/post/${postId}/like`)
            .set("Authorization", `Bearer ${global.TestAccessToken}`);

        expect(res.statusCode).toEqual(200);
    });
    /*
    it("should return 404 if the post is not found", async () => {
        const res = await request(app)
            .get(`/api/post/${noID}`) 
            .set("Authorization", `Bearer ${global.TestAccessToken}`); 

        expect(res.statusCode).toEqual(404);  
        
    });
    */
});
