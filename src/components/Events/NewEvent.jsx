import { Link, useNavigate } from "react-router-dom";

import Modal from "../UI/Modal.jsx";
import EventForm from "./EventForm.jsx";
import { useMutation } from "@tanstack/react-query";
import { createNewEvent, queryClient } from "../../util/http.js";
import ErrorBlock from "../UI/ErrorBlock.jsx";

export default function NewEvent() {
  const navigate = useNavigate();
  // POST처리할때는 useMutation
  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: createNewEvent,
    onSuccess: () => {
      //요청이 완료되고 데이터 refetch(새로 가져오기)
      // queryKey를 설정해서 해당하는 query만 무효화 가능.... exact기능을 쓸시엔 모든 query 무효화
      queryClient.invalidateQueries({ queryKey: ["events"] });
      //요청이 완료되고 페이지 이동
      navigate("/events");
    },
  });
  function handleSubmit(formData) {
    mutate({ event: formData });
  }

  return (
    <Modal onClose={() => navigate("../")}>
      <EventForm onSubmit={handleSubmit}>
        {isPending && "Submitting..."}
        {!isPending && (
          <>
            <Link to="../" className="button-text">
              Cancel
            </Link>
            <button type="submit" className="button">
              Create
            </button>
          </>
        )}
      </EventForm>
      {isError && (
        <ErrorBlock
          title="이벤트 생성 실패!"
          message={error.info?.message || "이벤트 생성 실패!!"}
        />
      )}
    </Modal>
  );
}
