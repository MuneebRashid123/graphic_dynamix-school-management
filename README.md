# Graphic Dynamix School SaaS — Login and School Workspace Demo

## Run the interface
1. Extract this ZIP.
2. Open the folder in VS Code.
3. Open `index.html` with Live Server.

## Demo login
- Graphic Dynamix administrator: `admin@graphicdynamix.demo`
- School administrator: select a school and use its email address shown in the login selector.
- Teacher: select a school; the demo email is `teacher@gd-sch-001.demo` for GD-SCH-001.
- Accountant: select a school; the demo email is `accounts@gd-sch-001.demo` for GD-SCH-001.
- Demo password for every role: `Demo123!`

Use the “Add a school” form while signed in as the Graphic Dynamix administrator. It creates a school in this browser demo and makes it available in the school login selector. New school demo password is `Demo123!`.

## Important security note
This is a front-end prototype. Demo credentials and browser storage are not secure authentication. The prototype demonstrates role-specific interfaces and sets a unique school scope (`schoolId`, role, and per-school browser storage key) for the active school. This is a UI demo only; it does not provide real multi-tenant security or guarantee isolation of all displayed sample records. Before real school use, connect Supabase Auth, create a school membership/profile table, attach every record to a `school_id`, and enforce Row Level Security (RLS) policies. Never use this demo password or browser-only storage for real student records.


## School privacy behavior in this update
- School accounts cannot use the Graphic Dynamix admin switch to return to the master dashboard.
- Each school portal has its own active school ID and demo storage namespace.
- Teacher and accountant menus are restricted to role-appropriate screens in the demo.
- The master administrator can add schools and open a school's portal for preview.
- **Before production:** implement Supabase Auth, school membership records, `school_id` on every school-owned table, and tested Row Level Security (RLS) policies. Front-end role checks and localStorage are not security boundaries.
