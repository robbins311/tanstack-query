import {
  Link,
  redirect,
  useNavigate,
  useNavigation,
  useParams,
  useSubmit,
} from "react-router-dom";

import Modal from "../UI/Modal.jsx";
import EventForm from "./EventForm.jsx";
import { useQuery } from "@tanstack/react-query";
import { fetchEvent, queryClient, updateEvent } from "../../util/http.js";
import ErrorBlock from "../UI/ErrorBlock.jsx";

export default function EditEvent() {
  const navigate = useNavigate();
  const { state } = useNavigation();
  const params = useParams();
  const submit = useSubmit();

  const { data, isError, error } = useQuery({
    queryKey: ["events", params.id],
    queryFn: ({ signal }) => fetchEvent({ signal, id: params.id }),
    // 캐시된 데이터가 10초 미만인 경우 다시 불러오지않고 해당 캐시된 데이터를 사용 (react query, router의 중복요청 방지)
    staleTime: 10000,
  });

  // react router로 바꾸기전
  // const { mutate } = useMutation({
  //   mutationFn: updateEvent,
  //   //변경상태 UI에 바로 반영하기 두번째 방법
  //   onMutate: async (data) => {
  //     // 두가지 인수를 받아옴 query key, 새로운 데이터(onmutate와 mutate가 연결되어있어 바로 가져옴)
  //     const newEvent = data.event;

  //     await queryClient.cancelQueries({ queryKey: ["events", params.id] });
  //     //롤백하기위한 작업(빈 칸 입력 등을 했을떄)
  //     const prevEvent = queryClient.getQueryData(["events", params.id]);

  //     queryClient.setQueryData(["events", params.id], newEvent);

  //     return { prevEvent };
  //   },
  //   onError: (error, data, context) => {
  //     //롤백하기위한 작업(빈 칸 입력 등을 했을떄)
  //     queryClient.setQueryData(["events", params.id], context.prevEvent);
  //   },

  //   // mutation이 끝날때마다 생성(백엔드에서 최신 데이터를 가져왔는지 확인 후 강제로 동기화함)
  //   onSettled: () => {
  //     queryClient.invalidateQueries(["events", params.id]);
  //   },
  // });

  // react router로 바꾸기전
  // function handleSubmit(formData) {
  //   // mutate({ id: params.id, event: formData });
  //   // navigate("../");
  // }

  //바꾼 후
  function handleSubmit(formData) {
    submit(formData, { method: "PUT" });
  }

  function handleClose() {
    navigate("../");
  }

  let content;

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
        {state === "submitting" ? (
          <p>Sending Data....</p>
        ) : (
          <>
            <Link to="../" className="button-text">
              Cancel
            </Link>
            <button type="submit" className="button">
              Update
            </button>
          </>
        )}
      </EventForm>
    );
  }

  return <Modal onClose={handleClose}>{content}</Modal>;
}
//컴포넌트가 불려지기 전에 함수를 호출할수있는 loader!
export function loader({ params }) {
  return queryClient.fetchQuery({
    queryKey: ["events", params.id],
    queryFn: ({ signal }) => fetchEvent({ signal, id: params.id }),
  });
}

export async function action({ request, params }) {
  const formData = await request.formData();
  const updatedEventData = Object.fromEntries(formData);
  await updateEvent({ id: params.id, event: updatedEventData });
  await queryClient.invalidateQueries(["events"]);

  return redirect("../");
}
