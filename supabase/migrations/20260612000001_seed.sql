-- Seed auth.users with two test accounts:
-- 1. admin@blog.com (password: Password123)
-- 2. author@blog.com (password: Password123)
-- Note: Supabase's handle_new_user trigger will automatically insert corresponding profiles into public.users.

-- We delete existing seed users to prevent primary key conflicts on multiple seed runs
DELETE FROM auth.users WHERE id IN ('c0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002');

INSERT INTO auth.users (
  id, 
  instance_id, 
  email, 
  encrypted_password, 
  email_confirmed_at, 
  raw_app_meta_data, 
  raw_user_meta_data, 
  created_at, 
  updated_at, 
  role, 
  aud, 
  confirmation_token
)
VALUES
  (
    'c0000000-0000-0000-0000-000000000001', 
    '00000000-0000-0000-0000-000000000000', 
    'admin@blog.com', 
    -- crypt('Password123', gen_salt('bf'))
    '$2a$10$W1l05c4zB2uS32Yq1/Dq0uEpyHhZ9eP0N75m8B13l7pE7H/y08wWq', 
    now(), 
    '{"provider":"email","providers":["email"]}', 
    '{"name":"Sarah Admin","role":"admin"}', 
    now(), 
    now(), 
    'authenticated', 
    'authenticated', 
    ''
  ),
  (
    'c0000000-0000-0000-0000-000000000002', 
    '00000000-0000-0000-0000-000000000000', 
    'author@blog.com', 
    -- crypt('Password123', gen_salt('bf'))
    '$2a$10$W1l05c4zB2uS32Yq1/Dq0uEpyHhZ9eP0N75m8B13l7pE7H/y08wWq', 
    now(), 
    '{"provider":"email","providers":["email"]}', 
    '{"name":"Alex Author","role":"author"}', 
    now(), 
    now(), 
    'authenticated', 
    'authenticated', 
    ''
  );

-- Wait, the trigger will execute synchronously and insert into public.users.
-- Just in case we run in environments where triggers aren't enabled on public schema directly,
-- we'll execute an UPSERT into public.users so the seed file works flawlessly even if triggers are disabled.
INSERT INTO public.users (id, name, email, role)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'Sarah Admin', 'admin@blog.com', 'admin'),
  ('c0000000-0000-0000-0000-000000000002', 'Alex Author', 'author@blog.com', 'author')
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name, email = EXCLUDED.email, role = EXCLUDED.role;


-- Seed sample posts
INSERT INTO public.posts (
  id, 
  user_id, 
  title, 
  slug, 
  summary, 
  content, 
  image_url, 
  category, 
  tags, 
  status, 
  created_at, 
  updated_at
)
VALUES
  (
    'a0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    'The Future of AI and Agentic Workflows',
    'the-future-of-ai-and-agentic-workflows',
    'Explore how autonomous AI agents are moving beyond simple chat interfaces to execute complex, multi-step code and software engineering tasks.',
    '# The Future of AI and Agentic Workflows

Artificial Intelligence is transitioning from passive chatbots to active, autonomous agents that can plan, execute, and refine their actions. In this post, we explore the core principles of **Agentic AI** and why they represent the next paradigm shift in software engineering.

## What are Agentic Workflows?

Unlike standard LLM completions where you provide a prompt and get a single response, an agentic workflow involves a continuous cycle of:

1. **Planning**: Breaking down a complex goal into granular, manageable steps.
2. **Tool Use**: Executing code, searching the web, reading local files, or making API calls.
3. **Observation**: Analyzing the output of tools and diagnosing errors.
4. **Refinement**: Self-correcting and iterating until the task is successfully accomplished.

```python
# A simple representation of an agent loop
def run_agent(goal):
    plan = create_plan(goal)
    for step in plan:
        result = execute_step(step)
        if not verify(result):
            adjust_plan(step, result)
```

## Why It Matters

By allowing LLMs to interact with environments, we unlock the ability to solve non-trivial engineering problems. Projects that once required hours of manual debugging can now be solved autonomously by agents running tests and fixing errors in real-time.

---

*What do you think about the rise of Agentic AI? Leave a comment or share this article!*',
    'https://images.unsplash.com/photo-1677442136019-21780efad99a?q=80&w=1200&auto=format&fit=crop',
    'AI & Machine Learning',
    ARRAY['AI', 'Agentic', 'Python', 'Future'],
    'Published',
    now() - INTERVAL '2 days',
    now() - INTERVAL '2 days'
  ),
  (
    'a0000000-0000-0000-0000-000000000002',
    'c0000000-0000-0000-0000-000000000002',
    'Mastering CSS Grid and Flexbox for Responsive Layouts',
    'mastering-css-grid-and-flexbox-for-responsive-layouts',
    'A deep dive into combining CSS Grid and Flexbox to build modern, fluid, and robust user interfaces for all screen sizes.',
    '# Mastering CSS Grid and Flexbox

Modern web layouts require flexibility, speed, and clean code. Developers often ask: *"Should I use CSS Grid or Flexbox?"* The answer is: **use both**. They are complementary layouts that solve different problems.

## Grid vs Flexbox: The Core Rule

- **CSS Grid** is for **two-dimensional** layouts (rows AND columns).
- **Flexbox** is for **one-dimensional** layouts (either a row OR a column).

## Layout Example: Header Navigation

Here is how simple it is to align items in a header using Flexbox:

```css
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
}
```

## Layout Example: Responsive Post Feed

For a multi-column card layout, Grid shines with auto-responsive tracking:

```css
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}
```

Using this setup, cards will automatically wrap and resize based on screen width without a single media query.

---

### Best Practices

1. Use **Flexbox** for alignment inside cards, navigation bars, and forms.
2. Use **Grid** for the page skeleton, sidebar + main layouts, and lists of cards.',
    'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=1200&auto=format&fit=crop',
    'Web Development',
    ARRAY['CSS', 'Grid', 'Flexbox', 'Frontend'],
    'Published',
    now() - INTERVAL '5 days',
    now() - INTERVAL '5 days'
  ),
  (
    'a0000000-0000-0000-0000-000000000003',
    'c0000000-0000-0000-0000-000000000002',
    '10 Productivity Habits for Remote Software Engineers',
    '10-productivity-habits-for-remote-software-engineers',
    'Practical strategies and daily routines to stay focused, prevent burnout, and excel in a remote-first software engineering role.',
    '# 10 Productivity Habits for Remote Engineers

Working remotely offers incredible freedom, but it also demands high self-discipline. It is easy for work and personal life boundaries to blur. Here are 10 habits to maximize productivity and keep your sanity.

1. **Establish a Dedicated Workspace**: Have a specific desk that is only for work. When you leave the desk, you are "off the clock".
2. **Use the Pomodoro Technique**: Focus intensely for 25 minutes, then take a 5-minute break. Repeat.
3. **Time-block Your Calendar**: Schedule deep work sessions and protect them from meetings.
4. **Write Down Daily Goals**: Start the morning by listing the top 3 items you *must* finish.
5. **Master Keyboard Shortcuts**: Reducing reliance on the mouse saves cumulative hours over a week.

## Keyboard Shortcuts Cheat Sheet

| Command | Action |
| --- | --- |
| `Ctrl + P` (VS Code) | Quick Open File |
| `Ctrl + Shift + L` | Select All Occurrences |
| `Alt + Click` | Multiple Cursors |

6. **Automate Repeat Tasks**: Write scripts or keyboard macros for common workflows.
7. **Take True Breaks**: Walk away from screens entirely during lunch or break times.
8. **Keep Slack/Teams in Check**: Close messaging apps when doing deep programming.
9. **Optimize Your Environment**: Invest in an ergonomic chair, a quality keyboard, and good lighting.
10. **Communicate Proactively**: Over-communicate status updates to your team to build trust.

*Implementing even two or three of these habits can make a dramatic difference in your focus and work-life balance.*',
    'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=1200&auto=format&fit=crop',
    'Productivity',
    ARRAY['Productivity', 'RemoteWork', 'Career'],
    'Published',
    now() - INTERVAL '10 days',
    now() - INTERVAL '10 days'
  ),
  (
    'a0000000-0000-0000-0000-000000000004',
    'c0000000-0000-0000-0000-000000000002',
    'Unpublished Draft: Scaling Express with Redis',
    'unpublished-draft-scaling-express-with-redis',
    'A draft exploring caching patterns in Express APIs using Redis for microsecond response times.',
    '# Scaling Express with Redis Cache

This is an unpublished draft. Here we will detail how to integrate Redis into a Node.js Express server to cache heavy database queries.

## Why Caching?

Database queries can be slow and expensive. Caching allows us to store frequently accessed data in-memory (RAM) for extremely fast reads.

### Basic Redis Setup

```javascript
const redis = require(\'redis\');
const client = redis.createClient();

client.on(\'error\', err => console.log(\'Redis Client Error\', err));

async function getCachedData(key) {
  await client.connect();
  const val = await client.get(key);
  return val ? JSON.parse(val) : null;
}
```

Stay tuned for the completed article!',
    'https://images.unsplash.com/photo-1508873535684-277a3cbcc4e8?q=80&w=1200&auto=format&fit=crop',
    'Technology',
    ARRAY['Express', 'Redis', 'Backend'],
    'Draft',
    now() - INTERVAL '1 day',
    now() - INTERVAL '1 day'
  );
