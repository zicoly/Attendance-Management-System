export default function Header() {
  return (
    <div>
      <div className="flex justify-between items-center">
        <h2>Welcome Stella!</h2>
        <select
          className="bg-accent p-2 rounded-full text-xs px-3"
          name=""
          id=""
        >
          <option value="">July 2025</option>
        </select>
      </div>
      {/* student details */}
      <div className="grid grid-cols-6 gap-x-4 text-sm border border-primary">
        <div className="flex flex-row items-center gap-x-4 gap-y-4">
          <div className="border border-primary w-[40px] h-[40px] rounded-full"></div>
          <div className="space-y-4">
            <h1>Obua Stella</h1>
            <div>
              <p>Matric Number</p>
              <p>LCU/UG/21/20698</p>
            </div>
          </div>
        </div>
        <div className=" rounded-full">
          <div className="mt-10">
            <p>Phone Number</p>
            <p>(+234) 8125002508</p>
          </div>
        </div>
        <div className=" rounded-full">
          <div className="mt-10">
            <p>Email Address</p>
            <p>stellaobua123@gmail.com</p>
          </div>
        </div>
        <div className=" rounded-full">
          <div className="mt-10">
            <p>Department</p>
            <p>Software Engineering</p>
          </div>
        </div>
        <div className=" rounded-full">
          <div className="mt-10">
            <p>Level</p>
            <p>400</p>
          </div>
        </div>
        <div className=" rounded-full">
          <div className="mt-10">
            <p>Courses registered</p>
            <p>9</p>
          </div>
        </div>
      </div>
    </div>
  );
}
