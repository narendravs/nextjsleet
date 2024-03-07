import { useState } from "react";

const useBoolenState = () => {
  const [success, setSuccess] = useState(false);
  const [solved, setSolved] = useState(false);
  return { success, solved, setSuccess, setSolved };
};
export default useBoolenState;
