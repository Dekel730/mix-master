# Mix Master 🍹

Mix Master is a full-stack social media application built with **React** and **Express**, both written in **TypeScript**. The platform allows users to create, share, and explore cocktail recipes. Users can follow others, like posts, and generate unique cocktails using **Google Gemini AI**. Additionally, curated cocktails are available from the external **CocktailsDB** API.

## Features

-   **Authentication & Google OAuth** – Secure login with email/password or Google authentication.
-   **Create & Share Cocktails** – Users can create custom cocktail recipes with ingredients and instructions.
-   **Follow & Like** – Follow other users and like their cocktail posts.
-   **Curated Cocktail Database** – Explore cocktails from **CocktailsDB**.
-   **AI-Powered Cocktail Creation** – Generate unique cocktail recipes using **Google Gemini AI**.

## Usage

1. Register or log in using email/password or Google authentication.
2. Browse featured cocktails from **CocktailsDB**.
3. Create a custom cocktail recipe and share it.
4. Like and comment on cocktails from other users.
5. Follow users to stay updated with their latest creations.
6. Generate cocktail recipes using **Google Gemini AI**.

## Technologies Used

-   **Frontend**: React, TypeScript, Vite
-   **Backend**: Express, TypeScript
-   **Database**: MongoDB
-   **Authentication**: JWT, Google OAuth
-   **External APIs**: CocktailsDB, Google Gemini AI
-   **Email Service**: NodeMailer

## Installation

### Prerequisites

-   **Node.js** (v16+ recommended)
-   **npm** or **yarn**
-   **MongoDB** (local or Atlas)

### Frontend Setup

1. Clone the repository:

    ```sh
    git clone https://github.com/yourusername/mix-master.git
    cd mix-master/client
    ```

2. Install dependencies:

    ```sh
    npm install
    ```

3. Create a `.env` file in the `client` directory and add the following environment variables:

    ```env
    VITE_API_URL=your_backend_api_url
    VITE_API_ADDRESS=your_backend_address
    VITE_GOOGLE_CLIENT_ID=your_google_client_id
    VITE_ENV=development
    ```

4. Start the development server:
    ```sh
    npm run dev
    ```

### Backend Setup

1. Navigate to the backend directory:

    ```sh
    cd ../server
    ```

2. Install dependencies:

    ```sh
    npm install
    ```

3. Create a `.env` file in the `server` directory and add the following environment variables:

    ```env
    PORT=your_port
    HTTPS_PORT=your_https_port
    MONGO_URI=your_mongodb_uri
    MONGO_URI_TEST=your_mongodb_test_uri
    EMAIL_API_URL=your_email_api_url
    EMAIL_API_KEY=your_email_api_key
    JWT_SECRET=your_jwt_secret
    JWT_SECRET_REFRESH=your_jwt_refresh_secret
    HOST_ADDRESS=your_frontend_url
    GOOGLE_CLIENT_ID=your_google_client_id
    GOOGLE_CLIENT_SECRET=your_google_client_secret
    GEMINI_API_KEY=your_gemini_api_key
    COCKTAILS_API_KEY=your_cocktails_api_key
    NODE_ENV=development_or_production
    ```

4. Start the development server:
    ```sh
    npm run dev
    ```

## Contributing

Contributions are welcome! Please fork the repository, create a new branch, and submit a pull request for review.

## License

This project is part of a **Computer Science degree** and is licensed for educational purposes.
