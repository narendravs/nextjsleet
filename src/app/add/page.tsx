"use client";
import { firestore } from "@/firebase/firebase";
import { useState } from "react";
import { doc, setDoc } from "firebase/firestore";

export default function AddProblem() {
  const [inputs, setInputs] = useState({
    id: "",
    title: "",
    difficulty: "Easy",
    category: "",
    videoId: "",
    link: "",
    order: 0,
    likes: 0,
    dislikes: 0,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setInputs({
      ...inputs,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setDoc(doc(firestore, "problems", inputs.id), {
        ...inputs,
        order: Number(inputs.order),
      });
      alert("Saved to DB");
    } catch (error) {
      console.error(error);
      alert("Error saving to DB");
    }
  };

  return (
    <div className="bg-black min-h-screen flex items-center justify-center text-white">
      <form
        className="p-6 flex flex-col gap-3 w-full max-w-md border rounded"
        onSubmit={handleSubmit}
      >
        <h1 className="text-2xl font-bold text-center mb-4">Add New Problem</h1>
        <input
          type="text"
          placeholder="Problem ID (slug)"
          name="id"
          value={inputs.id}
          onChange={handleInputChange}
          className="p-2 rounded bg-gray-700 border border-gray-600"
        />
        <input
          type="text"
          placeholder="Title"
          name="title"
          value={inputs.title}
          onChange={handleInputChange}
          className="p-2 rounded bg-gray-700 border border-gray-600"
        />
        <select
          name="difficulty"
          value={inputs.difficulty}
          onChange={handleInputChange}
          className="p-2 rounded bg-gray-700 border border-gray-600"
        >
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
        <input
          type="text"
          placeholder="Category"
          name="category"
          value={inputs.category}
          onChange={handleInputChange}
          className="p-2 rounded bg-gray-700 border border-gray-600"
        />
        <input
          type="number"
          placeholder="Order"
          name="order"
          value={inputs.order}
          onChange={handleInputChange}
          className="p-2 rounded bg-gray-700 border border-gray-600"
        />
        <input
          type="text"
          placeholder="Video ID (YouTube)"
          name="videoId"
          value={inputs.videoId}
          onChange={handleInputChange}
          className="p-2 rounded bg-gray-700 border border-gray-600"
        />
        <input
          type="text"
          placeholder="Link (optional)"
          name="link"
          value={inputs.link}
          onChange={handleInputChange}
          className="p-2 rounded bg-gray-700 border border-gray-600"
        />
        <button className="bg-orange-500 p-2 rounded font-bold hover:bg-orange-600">
          Save to Firestore
        </button>
      </form>
    </div>
  );
}
