import { useParams } from "react-router-dom";

const FieldDetail = () => {
  const { id } = useParams();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-4">Field #{id}</h1>
      <p className="text-gray-600">Field details coming soon.</p>
    </div>
  );
};

export default FieldDetail;
