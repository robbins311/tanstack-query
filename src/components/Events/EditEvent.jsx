import { Link, useNavigate, useParams } from "react-router-dom";

import Modal from "../UI/Modal.jsx";
import EventForm from "./EventForm.jsx";
import { useMutation, useQuery } from "@tanstack/react-query";
import { fetchEvent, queryClient, updateEvent } from "../../util/http.js";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";

export default function EditEvent() {
  const navigate = useNavigate();
  const params = useParams();

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["events", params.id],
    queryFn: ({ signal }) => fetchEvent({ signal, id: params.id }),
  });

  const { mutate } = useMutation({
    mutationFn: updateEvent,
    //변경상태 UI에 바로 반영하기 두번째 방법
    onMutate: async (data) => {
      // 두가지 인수를 받아옴 query key, 새로운 데이터(onmutate와 mutate가 연결되어있어 바로 가져옴)
      const newEvent = data.event;

      await queryClient.cancelQueries({ queryKey: ["events", params.id] });
      //롤백하기위한 작업(빈 칸 입력 등을 했을떄)
      const prevEvent = queryClient.getQueryData(["events", params.id]);

      queryClient.setQueryData(["events", params.id], newEvent);

      return { prevEvent };
    },
    onError: (error, data, context) => {
      //롤백하기위한 작업(빈 칸 입력 등을 했을떄)
      queryClient.setQueryData(["events", params.id], context.prevEvent);
    },

    // mutation이 끝날때마다 생성(백엔드에서 최신 데이터를 가져왔는지 확인 후 강제로 동기화함)
    onSettled: () => {
      queryClient.invalidateQueries(["events", params.id]);
    },
  });

  function handleSubmit(formData) {
    mutate({ id: params.id, event: formData });
    navigate("../");
  }

  function handleClose() {
    navigate("../");
  }

  let content;

  if (isPending) {
    content = (
      <div className="center">
        <LoadingIndicator />
      </div>
    );
  }

  if (isError) {
    content = (
      <>
        <ErrorBlock title="error!!" message={error.info?.message || "errrrr"} />
        <div className="form-actions">
          <Link to="../" className="button">
            Okay
          </Link>
        </div>
      </>
    );
  }

  if (data) {
    content = (
      <EventForm inputData={data} onSubmit={handleSubmit}>
        <Link to="../" className="button-text">
          Cancel
        </Link>
        <button type="submit" className="button">
          Update
        </button>
      </EventForm>
    );
  }

  return <Modal onClose={handleClose}>{content}</Modal>;
}
