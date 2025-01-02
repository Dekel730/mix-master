import { beforeAll, jest } from "@jest/globals";
import request from "supertest";
import app from "../server";
import User from "../models/userModel";
import Post from "../models/postModel";
import Comment from "../models/commentModel";
import dotenv from "dotenv";
import { getUserId } from "../controllers/userController";

dotenv.config();

// Define custom global variables with types
declare global {
    var TestRefreshToken: string;
    var TestUserId: string;
    var TestAccessToken: string;
    var postId: string;
    var TestRefreshToken2: string;
    var TestUserId2: string;
    var TestAccessToken2: string;
}

// Initialize global variables
global.TestRefreshToken = "";
global.TestUserId = "";
global.TestAccessToken = "";
global.TestRefreshToken2 = "";
global.TestUserId2 = "";
global.TestAccessToken2 = "";
global.postId = "";

jest.setTimeout(15000);

const post = {
    title: "Test Post",
    ingredients: [
        {
            name: "Test Ingredient",
            amount: "1 cup",
        },
    ],
    instructions: [
        {
            title: "Test Instruction",
            steps: ["Step 1", "Step 2"],
        },
    ],
};

beforeAll(async () => {
    // erase all data from the database
    await User.deleteMany({});
    await Post.deleteMany({});
    await Comment.deleteMany({});
    await request(app)
        .post("/api/user/register")
        .field("f_name", "test")
        .field("l_name", "test")
        .field("gender", "Male")
        .field("email", process.env.TEST_EMAIL_USER_1!)
        .field("password", process.env.TEST_PASSWORD_USER_1!)
        .attach("picture", "./tests/assets/test.jpeg");

    const userId = await getUserId(process.env.TEST_EMAIL_USER_1!);
    await request(app).get(`/api/user/verify/${userId}`);

    const res3 = await request(app)
        .post("/api/user/login")
        .send({
            email: process.env.TEST_EMAIL_USER_1!,
            password: process.env.TEST_PASSWORD_USER_1!,
            device: {
                id: "123",
                name: "test",
                type: "desktop",
            },
        });

    const res4 = await request(app)
        .post("/api/post")
        .set("Authorization", `Bearer ${res3.body.accessToken}`)
        .field("title", post.title)
        .field("instructions", JSON.stringify(post.instructions))
        .field("ingredients", JSON.stringify(post.ingredients));

    await request(app)
        .post("/api/user/register")
        .field("f_name", "test2")
        .field("l_name", "test2")
        .field("gender", "Female")
        .field("email", process.env.TEST_EMAIL_USER_2!)
        .field("password", process.env.TEST_PASSWORD_USER_2!)
        .attach("picture", "./tests/assets/test.jpeg");

    const userId2 = await getUserId(process.env.TEST_EMAIL_USER_2!);
    await request(app).get(`/api/user/verify/${userId2}`);

    const res7 = await request(app)
        .post("/api/user/login")
        .send({
            email: process.env.TEST_EMAIL_USER_2!,
            password: process.env.TEST_PASSWORD_USER_2!,
            device: {
                id: "12312",
                name: "test2",
                type: "desktop",
            },
        });

    global.TestRefreshToken = res3.body.refreshToken;
    global.TestUserId = userId;
    global.TestAccessToken = res3.body.accessToken;
    global.TestRefreshToken2 = res7.body.refreshToken;
    global.TestUserId2 = userId2;
    global.TestAccessToken2 = res7.body.accessToken;
    global.postId = res4.body.post._id;
});
