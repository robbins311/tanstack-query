import { useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { fetchEvents } from "../../util/http";
import LoadingIndicator from "../UI/LoadingIndicator";
import ErrorBlock from "../UI/ErrorBlock";
import EventItem from "./EventItem";

export default function FindEventSection() {
  //쿼리를 비활성화하기위해 undefined로 설정
  const [searchTerm, setSearchTerm] = useState();
  const searchElement = useRef();
  const { data, isLoading, isError, error } = useQuery({
    // 검색 버튼이 눌렸을때만 query를 전달하게 useRef가 아닌 useState사용
    queryKey: ["events", { search: searchTerm }],
    // 매개변수로 searchElement 전달
    queryFn: ({ signal, queryKey }) => fetchEvents({ signal, ...queryKey[1] }),
    //검색어가 입력되기전까지 검색하지않게 쿼리를 비활성화
    enabled: searchTerm !== undefined,
  });

  function handleSubmit(event) {
    event.preventDefault();
    // 검색 버튼이 눌렸을때만 query를 전달하게 useRef가 아닌 useState사용
    setSearchTerm(searchElement.current.value);
  }
  let content = <p>Please enter a search term and to find events.</p>;
  if (isLoading) {
    content = <LoadingIndicator />;
  }
  if (isError) {
    content = (
      <ErrorBlock
        title="An error occurred"
        message={error.info?.message || "Failed to fetch Events"}
      />
    );
  }

  if (data) {
    content = (
      <ul className="events-list">
        {data.map((event) => (
          <li key={event.id}>
            <EventItem event={event} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <section className="content-section" id="all-events-section">
      <header>
        <h2>Find your next event!</h2>
        <form onSubmit={handleSubmit} id="search-form">
          <input
            type="search"
            placeholder="Search events"
            ref={searchElement}
          />
          <button>Search</button>
        </form>
      </header>
      {content}
    </section>
  );
}
