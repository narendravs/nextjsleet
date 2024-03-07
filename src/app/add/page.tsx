"use client";
import { firestore } from "@/firebase/firebase";
import { FormEvent, useState } from "react";
import { doc, setDoc, collection } from "firebase/firestore";
import { problems } from "@/mockProblems/problems";

const Firestore = () => {
  const [id, setId] = useState("");
  const [title, SetTitle] = useState("");
  const [difficulty, SetDifficulty] = useState("");
  const [category, SetCategory] = useState("");
  const [order, SetOrder] = useState("");
  const [videoId, SetVideoId] = useState("");

  const sub = async (e: FormEvent) => {
    e.preventDefault();
    problems.map(async (doc1, idx) => {
      const data = {
        id: doc1.id,
        title: doc1.title,
        difficulty: doc1.difficulty,
        category: doc1.category,
        order: doc1.order,
        videoId: doc1.videoId,
      };

      try {
        // Add a new document with a generated id
        const newCityRef = doc(collection(firestore, "problems"));

        // later...
        await setDoc(newCityRef, data).then(() =>
          alert("Data submitted successfully")
        );
      } catch (error) {
        console.log("Error while loading data");
      }
    });

    // Add data to the store
    // db.collection("data")
    //   .add({
    //     Nane: name,
    //     Age: age,
    //     CourseEnrolled: course,
    //   })
    //   .then((docRef) => {
    //     alert("Data Successfully Submitted");
    //   })
    //   .catch((error) => {
    //     console.error("Error adding document: ", error);
    //   });
  };

  return (
    <div>
      <center>
        <form
          style={{ marginTop: "200px" }}
          onSubmit={(event) => {
            sub(event);
          }}
        >
          {/* <input
            type="text"
            placeholder="your id"
            onChange={(e) => {
              setId(e.target.value);
            }}
          />
          <br />
          <br />
          <input
            type="text"
            placeholder="your title"
            onChange={(e) => {
              SetTitle(e.target.value);
            }}
          />
          <br />
          <br />
          <input
            type="text"
            placeholder="Course difficulty"
            onChange={(e) => {
              SetDifficulty(e.target.value);
            }}
          />
          <br />
          <br />
          <input
            type="text"
            placeholder="Course category"
            onChange={(e) => {
              SetCategory(e.target.value);
            }}
          />
          <br />
          <br />
          <input
            type="number"
            placeholder="Course order"
            onChange={(e) => {
              SetOrder(e.target.value);
            }}
          />
          <br />
          <br />
          <input
            type="text"
            placeholder="Course videoId"
            onChange={(e) => {
              SetVideoId(e.target.value);
            }}
          />
          <br />
          <br /> */}
          <button type="submit" className="bg-gray-500 rounded-lg p-1 px-3">
            Submit
          </button>
        </form>
      </center>
    </div>
  );
};

export default Firestore;
