import {
  BellIcon,
  ChevronDownIcon,
  ImageIcon,
  SearchIcon,
  TrendingUpIcon,
  UsersIcon,
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

const navigationItems = [
  {
    icon: UsersIcon,
    label: "User Management",
    active: false,
  },
  {
    icon: ImageIcon,
    label: "Media Management",
    active: false,
  },
  {
    icon: TrendingUpIcon,
    label: "Expense Monitoring",
    active: true,
  },
];

const expenseData = [
  {
    date: "05 Jan 26",
    doctor: "Ananya Sharma",
    location: "Travel",
    amount: "3,200",
    fareAmount: "100",
    remark: "",
  },
  {
    date: "05 Jan 26",
    doctor: "Ananya Sharma",
    location: "Travel",
    amount: "3,200",
    fareAmount: "100",
    remark: "",
  },
  {
    date: "05 Jan 26",
    doctor: "Ananya Sharma",
    location: "Travel",
    amount: "3,200",
    fareAmount: "100",
    remark: "",
  },
];

export const Dashboard = (): JSX.Element => {
  return (
    <div className="flex min-h-screen bg-[#f7f8fa]">
      <aside className="w-[264px] bg-white flex flex-col">
        <div className="flex items-center justify-center pt-0 pb-6">
          <img
            className="w-[94px] h-[94px] object-cover"
            alt="Logo"
            src="/image-4.png"
          />
        </div>

        <nav className="flex flex-col gap-6 px-8">
          {navigationItems.map((item, index) => (
            <button
              key={index}
              className={`flex items-center gap-7 relative ${
                item.active ? "text-[#6aabfd]" : "text-[#5d5d5d]"
              }`}
            >
              {item.active && (
                <div className="absolute -left-8 w-1 h-[33px] bg-[#fa841c]" />
              )}
              <item.icon className="w-6 h-6" />
              <span className="[font-family:'Inter',Helvetica] font-normal text-base">
                {item.label}
              </span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col">
        <header className="h-20 bg-white shadow-[0px_2px_4px_#d9d9d940] flex items-center justify-between px-6">
          <h1 className="[font-family:'Inter',Helvetica] font-medium text-black text-[32px]">
            Dashboard
          </h1>

          <div className="flex items-center gap-6">
            <div className="relative w-[327px]">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
              <Input
                type="text"
                placeholder="Type to Search"
                className="pl-12 h-[41px] rounded-[10px] border-black [font-family:'Inter',Helvetica] font-medium text-[15px] placeholder:text-[#b8b3b3]"
              />
            </div>

            <button className="relative">
              <BellIcon className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-3">
              <Avatar className="w-[30px] h-[30px]">
                <AvatarImage src="/ellipse-1.svg" alt="Cathy" />
                <AvatarFallback>C</AvatarFallback>
              </Avatar>
              <span className="[font-family:'Inter',Helvetica] font-normal text-black text-[15px]">
                Cathy
              </span>
              <ChevronDownIcon className="w-6 h-6" />
            </div>
          </div>
        </header>

        <div className="flex-1 p-6 flex flex-col gap-6">
          <div className="flex gap-6">
            <Card className="w-[374px] bg-white rounded-[10px] shadow-[0px_2px_4px_#bcbcbc33]">
              <CardContent className="flex flex-col items-center pt-11 pb-6">
                <img
                  className="w-[135px] h-[140px] object-cover mb-12"
                  alt="Expense illustration"
                  src="/image-14.png"
                />
                <Button className="w-[328px] h-[74px] bg-[#f9831b] hover:bg-[#e67710] rounded-[15px] [font-family:'Inter',Helvetica] font-semibold text-white text-base">
                  View All User Expenses
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="flex-1 bg-white rounded-[10px] shadow-[0px_2px_4px_#bcbcbc33]">
            <CardContent className="p-6">
              <h2 className="[font-family:'Inter',Helvetica] font-medium text-black text-lg mb-6">
                Recent Expense Table
              </h2>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="[font-family:'Inter',Helvetica] font-medium text-[#1e1e1e] text-base">
                      Date
                    </TableHead>
                    <TableHead className="[font-family:'Inter',Helvetica] font-medium text-[#1e1e1e] text-base">
                      Doctor's Met
                    </TableHead>
                    <TableHead className="[font-family:'Inter',Helvetica] font-medium text-[#1e1e1e] text-base">
                      Location
                    </TableHead>
                    <TableHead className="[font-family:'Inter',Helvetica] font-medium text-[#1e1e1e] text-base">
                      Amount (₹)
                    </TableHead>
                    <TableHead className="[font-family:'Inter',Helvetica] font-medium text-[#1e1e1e] text-base">
                      fare amount
                    </TableHead>
                    <TableHead className="[font-family:'Inter',Helvetica] font-medium text-[#1e1e1e] text-base">
                      Remark
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenseData.map((expense, index) => (
                    <TableRow key={index}>
                      <TableCell className="[font-family:'Inter',Helvetica] font-medium text-[#5d5d5d] text-base">
                        {expense.date}
                      </TableCell>
                      <TableCell className="[font-family:'Inter',Helvetica] font-medium text-[#5d5d5d] text-base">
                        <div className="flex items-center gap-2">
                          {expense.doctor}
                          <img
                            className="w-7 h-7 object-cover"
                            alt="Doctor"
                            src="/image-15.png"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="[font-family:'Inter',Helvetica] font-medium text-[#5d5d5d] text-base">
                        {expense.location}
                      </TableCell>
                      <TableCell className="[font-family:'Inter',Helvetica] font-medium text-[#5d5d5d] text-base">
                        {expense.amount}
                      </TableCell>
                      <TableCell className="[font-family:'Inter',Helvetica] font-medium text-[#5d5d5d] text-base">
                        {expense.fareAmount}
                      </TableCell>
                      <TableCell className="[font-family:'Inter',Helvetica] font-medium text-[#5d5d5d] text-base">
                        {expense.remark}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};
