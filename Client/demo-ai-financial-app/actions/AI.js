"use server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Scan Receipt
export async function scanReceipt(file) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    // Convert ArrayBuffer to Base64
    const base64String = Buffer.from(arrayBuffer).toString("base64");

    const prompt = `
        Analyze this receipt image and extract the following information in JSON format:
        - Total amount (just the number)
        - Date (in ISO format)
        - Description or items purchased (brief summary)
        - Merchant/store name
        - Suggested category (one of: housing,transportation,groceries,utilities,entertainment,food,shopping,healthcare,education,personal,travel,insurance,gifts,bills,other-expense )
        
        Only respond with valid JSON in this exact format:
        {
          "amount": number,
          "date": "ISO date string",
          "description": "string",
          "merchantName": "string",
          "category": "string"
        }
  
        If its not a recipt, return an empty object
      `;

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64String,
          mimeType: file.type,
        },
      },
      prompt,
    ]);

    const response = await result.response;
    const text = response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

    try {
      const data = JSON.parse(cleanedText);
      return {
        amount: parseFloat(data.amount),
        date: new Date(data.date),
        description: data.description,
        category: data.category,
        merchantName: data.merchantName,
      };
    } catch (parseError) {
      console.error("Error parsing JSON response:", parseError);
      throw new Error("Invalid response format from Gemini");
    }
  } catch (error) {
    console.error("Error scanning receipt:", error);
    throw new Error("Failed to scan receipt");
  }
}

export async function generateFinancialHealthReport(summarizedData) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Convert summarizedData into a JSON string with indentation for clarity
    const inputData = JSON.stringify(summarizedData, null, 2);

    // Define the prompt with the instructions and embed the JSON data
    const prompt = `
  You are an AI financial advisor. Using the user's historical financial data provided below—which includes a detailed transaction summary, account balances, and recurring transaction details—please perform the following analysis:
  
  Calculate a Financial Health Score: Develop a score on a scale from 0 to 100 that reflects the user's financial health. Consider factors such as:
  - The ratio of income to expenses.
  - Trends in recurring transactions (e.g., how consistently recurring expenses occur).
  - The overall account balances (savings and checking).
  
  Provide Improvement Suggestions: Based on the computed score and your analysis, offer actionable recommendations to improve the user's financial health. For instance, if the score is low due to high recurring expenses relative to income, suggest strategies to reduce these expenses or increase income.
  
  Present your findings in a clear, concise report that includes:
  - The calculated financial health score.
  - A breakdown of key factors influencing the score.
  - Specific, actionable suggestions to improve the score.
  
  Use the following input data:
  ${inputData}
  
  Return your output as plain Markdown format in a structured report.
  JUST reponse with md format, no other text or explanation.
      `;

    // Generate content using the model
    const result = await model.generateContent([prompt]);
    const response = await result.response;
    const text = await response.text();
    return text;
  } catch (error) {
    console.error("Error generating Financial Health Report:", error);
    throw new Error("Failed to generate Financial Health Report");
  }
}

export async function generateCashFlowBudgetReport(summarizedData) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    // Convert summarizedData into a JSON string (formatted for clarity)
    const inputData = JSON.stringify(summarizedData, null, 2);

    // Define the prompt with clear instructions for cash flow forecasting and budgeting advice.
    const prompt = `
  You are an AI financial analyst. Given the historical financial data below—comprising transactions (both income and expenses), account balances, and budget information—please perform the following tasks:
  
  1. **Forecast Monthly Cash Flow:** Analyze the transaction history to forecast the user's cash flow for the next three months. Identify periods where the user is likely to have a surplus or a shortage.
  
  2. **Budget Recommendations:** For each expense category (e.g., housing, food, entertainment, etc.), compare the user's spending with typical spending ranges. For example, if spending on 'entertainment' is 20% above an average or recommended level, suggest setting a spending limit.
  
  Provide your analysis as a concise report with bullet points that include:
  - A summary of forecasted cash flow trends.
  - Specific budget recommendations per expense category.
  
  Use the following input data:
  ${inputData}
  
  Please return your output structured with clear sections for the cash flow 
  forecast and the budgeting advice.
  Return your output as plain Markdown format in a structured report.
  JUST reponse with md format, no other text or explanation.
      `;

    // Generate the content using the model
    const result = await model.generateContent([prompt]);
    const response = await result.response;
    const text = await response.text();
    return text;
  } catch (error) {
    console.error("Error generating Cash Flow & Budgeting Report:", error);
    throw new Error("Failed to generate Cash Flow & Budgeting Report");
  }
}
