import { useLocation, useNavigate } from "react-router-dom";

export const useGoBack = (statusCode: number = 200) => {
  const location = useLocation();
  const navigate = useNavigate();
  const thereIsAPrevPage = location.key !== "default";

  if (statusCode === 403) {
    return (_arg: { fallback?: string }) => navigate(-2);
  }

  if (thereIsAPrevPage) {
    return (_arg: { fallback?: string }) => navigate(-1);
  } else {
    return ({ fallback }: { fallback?: string }) => navigate(fallback || "/");
  }
};
