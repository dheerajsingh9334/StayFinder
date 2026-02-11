import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProperties } from "../../features/property/property.hooks";
import { ThreeDot } from "react-loading-indicators";

export default function PropertyList() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useProperties(page);
  if (isLoading) {
    return <ThreeDot color={["#32cd32", "#327fcd", "#cd32cd", "#cd8032"]} />;
  }

  if (isError || !data) {
    return <div>Failed to load data</div>;
  }

  const { data: items, totalPage } = data;
  const handlePrev = () => {
    if (page > 1) setPage((p: number) => p - 1);
  };
  const handleNext = () => {
    if (page < totalPage) setPage((p) => p + 1);
  };
  return (
    <div>
      {items.map((p) => (
        <div
          key={p.id}
          onClick={() => navigate(`/properties/${p.id}`)}
          style={{
            cursor: "pointer",
            border: "1px solid #ccc",
            margin: 10,
            padding: 10,
          }}
        >
          <h2>{p.title}</h2>
          <h3>{p.price}</h3>
          <h3>{p.state}</h3>
          {p.images?.[0] && <img src={p.images[0]} />}
        </div>
      ))}
      <button onClick={handlePrev} disabled={page === 1}>
        prev
      </button>
      <span style={{ margin: "0 10px" }}>
        Page{page} of {totalPage}
      </span>
      <button onClick={handleNext} disabled={page === totalPage}>
        next
      </button>
    </div>
  );
}
