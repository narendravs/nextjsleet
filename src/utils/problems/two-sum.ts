import assert from "assert";
import { Problem } from "../types/problem";

const starterCodeTwoSum = `function twoSum(nums,target){
  // Write your code here
};`;

// Move test data outside the handler to improve performance (avoids re-allocation)
const TWO_SUM_TEST_DATA = {
  nums: [
    [2, 7, 11, 15],
    [3, 2, 4],
    [3, 3],
  ],
  targets: [9, 6, 6],
  answers: [
    [0, 1],
    [1, 2],
    [0, 1],
  ],
};

const handlerTwoSum = (fn: any) => {
  try {
    for (let i = 0; i < TWO_SUM_TEST_DATA.nums.length; i++) {
      const result = fn(
        TWO_SUM_TEST_DATA.nums[i],
        TWO_SUM_TEST_DATA.targets[i],
      );
      assert.deepStrictEqual(result, TWO_SUM_TEST_DATA.answers[i]);
    }
    return true;
  } catch (error: any) {
    console.error("twoSum handler function error:", error);
    throw new Error(error);
  }
};

export const twoSum: Problem = {
  id: "two-sum",
  title: "1. Two Sum",
  problemStatement: `<div class='space-y-4'>
  <p>
    Given an array of integers <code>nums</code> and an integer <code>target</code>, return
    <em>indices of the two numbers such that they add up to</em> <code>target</code>.
  </p>
  <p>
    You may assume that each input would have <strong>exactly one solution</strong>, and you
    may not use the <strong>same</strong> element twice.
  </p>
  <p>You can return the answer in any order.</p>
</div>`,
  examples: [
    {
      id: 1,
      inputText: "nums = [2,7,11,15], target = 9",
      outputText: "[0,1]",
      explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
    },
    {
      id: 2,
      inputText: "nums = [3,2,4], target = 6",
      outputText: "[1,2]",
      explanation: "Because nums[1] + nums[2] == 6, we return [1, 2].",
    },
    {
      id: 3,
      inputText: "nums = [3,3], target = 6",
      outputText: "[0,1]",
    },
  ],
  constraints: `<ul class='list-disc ml-5 space-y-2 text-gray-200'>
  <li><code>2 ≤ nums.length ≤ 10</code></li>
  <li><code>-10 ≤ nums[i] ≤ 10</code></li>
  <li><code>-10 ≤ target ≤ 10</code></li>
  <li class='text-sm italic'><strong>Only one valid answer exists.</strong></li>
</ul>`,
  handlerFunction: handlerTwoSum,
  starterCode: starterCodeTwoSum,
  order: 1,
  starterFunctionName: "function twoSum(",
};
