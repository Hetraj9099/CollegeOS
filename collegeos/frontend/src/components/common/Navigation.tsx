import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Dashboard" },
  { to: "/calendar", label: "Calendar" },
  { to: "/tasks", label: "Tasks" },
  { to: "/timetable", label: "Timetable" },
  { to: "/study/timer", label: "Study Timer" },
  { to: "/grades", label: "Grades" },
  { to: "/analytics", label: "Analytics" }
];

export function Navigation() {
  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl gap-4 p-4">
        {links.map((link) => (
          <NavLink key={link.to} to={link.to}>
            {link.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
