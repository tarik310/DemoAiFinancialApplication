import TransactionCom from "@/app/_PagesComponents/TransactionCom";

export default async function TransactionPage({ searchParams }) {
  const params = await searchParams; // Await the searchParams
  const editId = params?.edit;
  return <TransactionCom editId={editId} />;
}
