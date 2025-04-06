# FinGinus AI

This is a cutting-edge financial management application powered by AI. It provides a complete solution for tracking, analyzing, and optimizing personal finances by leveraging artificial intelligence to generate actionable insights and reports.

---

## Overview

This application is designed to empower users with smart finance management tools. By integrating AI-driven analysis, it helps users track transactions, scan receipts, and receive personalized financial health and budgeting recommendations. The project combines modern web technologies with robust backend services to deliver a seamless experience for both demo and authenticated users.

---

## Features

- **AI-Driven Receipt Scanning:**  
  Analyze receipt images to extract key data such as total amount, date, merchant name, and expense category.

- **Financial Health Reports:**  
  Generate detailed reports that provide a financial health score along with improvement suggestions based on historical financial data.

- **Cash Flow & Budgeting Insights:**  
  Forecast monthly cash flow trends and receive personalized budgeting advice across various expense categories.

- **User & Account Management:**  
  Support for multiple user accounts with authentication and personalized dashboards.

- **Demo Mode:**  
  Allows users to explore the application without logging in, using pre-configured demo data.

- **Responsive and Intuitive UI:**  
  Built with modern frameworks and styling for a smooth user experience on both desktop and mobile devices.

---

## Tech Stack

- **Frontend:**

  - [Next.js](https://nextjs.org/)
  - [Tailwind CSS](https://tailwindcss.com/)

- **Backend:**

  - [Node.js](https://nodejs.org/)
  - [ExpressJS](https://expressjs.com/)
  - [Prisma](https://www.prisma.io/)
  - [PostgreSQL](https://www.postgresql.org/)

- **Cloud & Deployment:**

  - [AWS EC2](https://aws.amazon.com/ec2/)
  - [AWS RDS](https://aws.amazon.com/rds/)
  - [AWS API Gateway](https://aws.amazon.com/api-gateway/)
  - [AWS Amplify](https://aws.amazon.com/amplify/)

- **Authentication:**

  - [Clerk](https://clerk.dev/)

- **AI Integration:**
  - [Google Generative AI](https://developers.generativeai.google/) for processing receipt images and generating financial reports

---

## Architecture & Implementation

### AI Integration

- **Receipt Scanning:**  
  The application uses the Google Generative AI model to process receipt images. The image is converted into Base64 and analyzed by the model to extract relevant financial data in JSON format.

- **Financial Reports:**  
  Two separate endpoints generate financial reports:
  - **Financial Health Report:** Computes a score based on income, expenses, account balances, and recurring transactions, providing improvement suggestions.
  - **Cash Flow & Budget Report:** Forecasts the cash flow for upcoming months and offers budgeting recommendations per expense category.

### Server & Client Communication

- **API Endpoints:**  
  ExpressJS routes handle requests for user transactions, account management, and budget updates. They integrate with the backend API (deployed on AWS) and use caching strategies to ensure up-to-date data.

- **User Authentication:**  
  The application utilizes Clerk for secure user authentication and authorization, with support for demo users.

- **Real-Time Data Revalidation:**  
  Next.js revalidation strategies are employed to ensure that the dashboard and account pages reflect the most current data after updates.

---
