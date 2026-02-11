import { useNavigate } from "react-router-dom";
import { ThreeDot } from "react-loading-indicators";
import { useOwnerProperties } from "../../features/property/property.hooks";
import { useState } from "react";

export default function OwnerProperty() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error, isFetching } =
    useOwnerProperties(page);
  if (!data) {
    return null;
  }
  if (isLoading)
    return <ThreeDot color={["#32cd32", "#327fcd", "#cd32cd", "#cd8032"]} />;

  if (isError) {
    return <div>{error instanceof Error ? error.message : "Error"}</div>;
  }
  console.log(data);

  const { data: items, totalPage } = data;

  if (!totalPage) {
    console.log("total page is not found");
  }

  if (totalPage) {
    console.log(totalPage);
  }
  const handlePrev = () => {
    if (page > 1) {
      setPage((p) => p - 1);
    }
  };

  const handleNext = () => {
    if (page < totalPage) {
      setPage((p) => p + 1);
    }
  };

  return (
    <div>
      <h2>owner Property</h2>
      {isFetching && <p>Updatingg....</p>}
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
          <h3>{p.title}</h3>
          <h3>{p.price}</h3>
          <h3>{p.state}</h3>
          {p.images[0] && <img src={p.images[0]} width={150} />}
        </div>
      ))}
      <button onClick={handlePrev} disabled={page == 1}>
        Prev
      </button>
      <span>
        Page{page} of {totalPage}
      </span>
      <button onClick={handleNext} disabled={page === totalPage}>
        Next
      </button>
    </div>
  );
}
