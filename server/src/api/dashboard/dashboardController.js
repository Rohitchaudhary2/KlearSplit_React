import asyncHandler from "../utils/asyncHandler.js";
import { responseHandler } from "../utils/responseHandler.js";
import DashboardService from "./dashboardService.js";

class DashboardController {
  static getExpensesCount = asyncHandler(async(req, res) => {
    // const expensesCount = await DashboardService.getExpensesCount(req.user.user_id);
    const expensesCount = [5, 3, 0, 0, 0];

    responseHandler(res, 200, "Successfully fetched expenses count", expensesCount);
  });

  static getBalance = asyncHandler(async(req, res) => {
    // const balance = await DashboardService.getBalance(req.user.user_id);
    const balance = [4310, 4760];

    responseHandler(res, 200, "Successfully fetched balance", balance);
  });

  static topCashFlowFriends = asyncHandler(async(req, res) => {
    // const topFriends = await DashboardService.topCashFlowFriends(req.user.user_id);
    const topFriends = {
      "1": {
        "amount": 9070,
        "friend": "Rohit Chaudhary"
      },
      "2": {
        "amount": 6500,
        "friend": "Ritik Palial"
      },
      "3": {
        "amount": 3000,
        "friend": "Vikas"
      },
      "4": {
        "amount": 1000,
        "friend": "Ranveer Singh"
      },
      "5": {
        "amount": 15000,
        "friend": "Others"
      },
    }

    responseHandler(res, 200, "Successfully fetched top cash flow friends", topFriends);
  });

  static topcashflowGroups = asyncHandler(async(req, res) => {
    // const topGroups = await DashboardService.topCashFlowGroups(req.user.user_id);
    const topGroups = {
      "1": {
        "amount": 20000,
        "group": "Trip"
      },
      "2": {
        "amount": 15000,
        "group": "Roomies"
      },
      "3": {
        "amount": 12000,
        "group": "Besties"
      },
      "4": {
        "amount": 10000,
        "group": "Trip 2"
      },
      "5": {
        "amount": 15000,
        "group": "Others"
      },
    }

    responseHandler(res, 200, "Successfully fetched top cash flow groups", topGroups);
  });

  static getMonthlyExpenses = asyncHandler(async(req, res) => {
    // const monthlyExpense = await DashboardService.getMonthlyExpenses(req.user.user_id, req.body.year);

    const monthlyExpense = req.body.year === 2025 ? [7321, 9123, 5610, 8345, 6214, 7589, 9820, 6931, 5456, 9992, 8761, 5240] : [8543, 7422, 9311, 6780, 8129, 9976, 5534, 5800, 7631, 9005, 6993, 5248];
    responseHandler(res, 200, "Successfully fetched monthly expenses", monthlyExpense);
  });
}

export default DashboardController;
