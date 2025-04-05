import AccountCom from "@/app/_PagesComponents/AccountCom";

export default async function AccountPage({ params }) {
  const { id } = await params;
  return <AccountCom accId={id} />;
}
