import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store";
import { getOwnerProperty } from "../../features/property/property.hooks";
import { useNavigate } from "react-router-dom";
import { ThreeDot } from "react-loading-indicators";

export default function OwnerProperty() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { items, page, totalPage } = useSelector(
    (state: RootState) => state.property.owner,
  );
  const { isLoading } = useSelector((state: RootState) => state.property);
  useEffect(() => {
    console.log("CALLING OWNER API WITH PAGE:", page);
    dispatch(getOwnerProperty(page));
  }, [dispatch, page]);

  const handlePrev = () => {
    if (page > 1) {
      dispatch(getOwnerProperty(page - 1));
    }
  };

  const handleNext = () => {
    if (page < totalPage) {
      dispatch(getOwnerProperty(page + 1));
    }
  };

  if (isLoading)
    return <ThreeDot color={["#32cd32", "#327fcd", "#cd32cd", "#cd8032"]} />;
  return (
    <div>
      <h2>owner Property</h2>
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
          <h3>{p.images[0]}</h3>
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
