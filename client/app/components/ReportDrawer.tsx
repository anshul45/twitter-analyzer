import { Drawer } from "antd";
import { useEffect, useState } from "react";
import { getTweets } from "~/common/api.request";

const ReportDrawer = ({ open, setOpen, cashtag }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);  // Add loading state
  const [error, setError] = useState(null);  // Add error state

  const fetchData = async (cashtag) => {
    try {
      setLoading(true);  // Start loading
      const response = await getTweets(cashtag, "");
      setData(response);  // Set the data once fetched
    } catch (err) {
      setError(err);  // Handle any error that occurs during fetching
    } finally {
      setLoading(false);  // Stop loading
    }
  };

  useEffect(() => {
    if (cashtag) {
      fetchData(cashtag);  // Fetch new data when cashtag changes
    }
  }, [cashtag]);  // Add cashtag to the dependency array

  return (
    <Drawer open={open} onClose={() => setOpen(false)}>
      <h1 className="font-semibold text-2xl">Report</h1>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div>Error fetching data: {error.message}</div>
      ) : (
        <div>{data?.report || "No report data available"}</div>
      )}
    </Drawer>
  );
};

export default ReportDrawer;
