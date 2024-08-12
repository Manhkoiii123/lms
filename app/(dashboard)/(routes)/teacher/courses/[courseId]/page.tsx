const page = ({ params }: { params: { courseId: string } }) => {
  return <div>page {params.courseId}</div>;
};

export default page;
