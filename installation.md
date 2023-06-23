## Installation

To set up the File Manager Backend Service on your local machine, follow these steps:

1. Clone the repository:
   ```
   git clone https://github.com/your-username/file-manager-backend.git
   ```
2. Navigate to the project directory:
   ```
   cd file-manager-backend
   ```
3. Install the dependencies:
   ```
   npm install
   ```
4. Set up the environment variables:
   - Create a `.env` file in the root directory of the project.
   - Add the following environment variables to the `.env` file:
     ```
     PORT=3000
     MONGODB_URI=mongodb://localhost:27017/file-manager
     REDIS_URI=redis://localhost:6379
     SECRET_KEY=your-secret-key
     ```
   - Modify the values as per your configuration. Make sure to have MongoDB and Redis installed and running on your local machine.

5. Start the development server:
   ```
   npm run dev
   ```
   This will start the backend server on `http://localhost:3000`.

You have successfully installed the File Manager Backend Service. Now you can start building and exploring the features.