import request from "supertest";
import app from "../server";
import { describe, expect, it } from "@jest/globals";

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

    it("should return 201 if post created successfully - create post", async () => {
        const res = await request(app)
            .post("/api/post")
            .set("Authorization", `Bearer ${global.TestAccessToken}`)
            .field("title", post.title)
            .field("instructions", JSON.stringify(post.instructions))
            .field("ingredients", JSON.stringify(post.ingredients));

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
            .get(`/api/post/user/${global.TestUserId}`)
            .set("Authorization", `Bearer ${global.TestAccessToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("posts");
        expect(res.body.posts).toBeInstanceOf(Array);
    });

    it("should return 404 if post not found - update post", async () => {
        const res = await request(app)
            .put(`/api/post/${noID}`)
            .set("Authorization", `Bearer ${global.TestAccessToken}`)
            .field("title", post.title)
            .field("ingredients", JSON.stringify(post.ingredients))
            .field("instructions", JSON.stringify(post.instructions));

        expect(res.statusCode).toEqual(404);
    });

    it("should return 400 if invalid input - updatedPost", async () => {
        const res = await request(app)
            .put(`/api/post/${postId}`)
            .set("Authorization", `Bearer ${global.TestAccessToken}`);

        expect(res.statusCode).toEqual(400);
    });

    it("should return 400 if invalid instructions or ingredients - updatedPost", async () => {
        const res = await request(app)
            .put(`/api/post/${postId}`)
            .set("Authorization", `Bearer ${global.TestAccessToken}`)
            .field("title", post.title)
            .field("ingredients", JSON.stringify([]))
            .field("instructions", JSON.stringify([]));


        expect(res.statusCode).toEqual(400);
    });
    it("should return 200 if the post was updated successfully", async () => {
        const res = await request(app)
            .put(`/api/post/${postId}`)
            .set("Authorization", `Bearer ${global.TestAccessToken}`)
            .field("title",post.title)
            .field("ingredients",JSON.stringify(post.ingredients))
            .field("instructions",JSON.stringify(post.instructions));


        expect(res.statusCode).toEqual(200);
    });

    it("should return 404 if the Post not exist", async () => {
        const res = await request(app)
            .post(`/api/post/${noID}/like`)
            .set("Authorization", `Bearer ${global.TestAccessToken}`);

        expect(res.statusCode).toEqual(404);
    });

    it("should return 200 if the post was like successfully", async () => {
        const res = await request(app)
            .post(`/api/post/${postId}/like`)
            .set("Authorization", `Bearer ${global.TestAccessToken}`);

        expect(res.statusCode).toEqual(200);
    });

    it("should return 200 if the post was unlike successfully", async () => {
        const res = await request(app)
            .post(`/api/post/${postId}/like`)
            .set("Authorization", `Bearer ${global.TestAccessToken}`);

        expect(res.statusCode).toEqual(200);
    });

    it("should return 404 if the Post is not found", async () => {
        const res = await request(app)
            .get(`/api/post/${noID}`)
            .set("Authorization", `Bearer ${global.TestAccessToken}`);

        expect(res.statusCode).toEqual(404);
    });

    it("should return 200 if the post was liked successfully", async () => {
        const res = await request(app)
            .get(`/api/post/${postId}`)
            .set("Authorization", `Bearer ${global.TestAccessToken}`);

        expect(res.statusCode).toEqual(200);
    });

    it("should return 404 if the Post not found", async () => {
        const res = await request(app)
            .delete(`/api/post/${noID}`)
            .set("Authorization", `Bearer ${global.TestAccessToken}`);

        expect(res.statusCode).toEqual(404);
    });

    it("should return 200 if the post deleted successfully", async () => {
        const res = await request(app)
            .delete(`/api/post/${postId}`)
            .set("Authorization", `Bearer ${global.TestAccessToken}`);

        expect(res.statusCode).toEqual(200);
    });

});
