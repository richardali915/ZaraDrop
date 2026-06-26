-- ZaraDrop Enterprise Schema
-- Single PostgreSQL database for customers, riders, merchants, finance, support, operations, and auditing.

create extension if not exists "uuid-ossp";

-- Core identity model --------------------------------------------------------
create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  email text not null unique,
  phone text unique,
  full_name text,
  preferred_name text,
  avatar_url text,
  metadata jsonb default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table if not exists roles (
  id serial primary key,
  slug text not null unique,
  name text not null,
  description text
);

create table if not exists permissions (
  id serial primary key,
  code text not null unique,
  name text not null,
  category text not null,
  description text
);

create table if not exists role_permissions (
  role_id int not null references roles(id) on delete cascade,
  permission_id int not null references permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);

create table if not exists user_roles (
  user_id uuid not null references users(id) on delete cascade,
  role_id int not null references roles(id) on delete cascade,
  granted_by uuid references users(id),
  granted_at timestamp with time zone not null default now(),
  primary key (user_id, role_id)
);

create unique index if not exists idx_user_roles_user_role on user_roles(user_id, role_id);

-- Identity extension records
create table if not exists device_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  device_type text,
  device_name text,
  ip_address inet,
  user_agent text,
  refresh_token text,
  last_seen_at timestamp with time zone not null default now(),
  created_at timestamp with time zone not null default now(),
  revoked_at timestamp with time zone
);

create table if not exists suspensions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  reason text not null,
  suspended_by uuid references users(id),
  suspended_at timestamp with time zone not null default now(),
  expires_at timestamp with time zone,
  active boolean not null default true
);

-- Profiles and business entities ------------------------------------------------
create table if not exists customers (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null unique references users(id) on delete cascade,
  loyalty_tier text default 'standard',
  default_address_id uuid,
  wallet_id uuid,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table if not exists merchants (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null unique references users(id) on delete cascade,
  store_name text not null,
  store_code text not null unique,
  business_type text,
  business_phone text,
  business_email text,
  address text,
  operating_zone text,
  status text not null default 'pending',
  rating numeric(3,2) default 0,
  total_sales bigint default 0,
  verification_metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table if not exists merchants_documents (
  id uuid primary key default uuid_generate_v4(),
  merchant_id uuid not null references merchants(id) on delete cascade,
  type text not null,
  file_url text not null,
  status text not null default 'pending',
  uploaded_at timestamp with time zone not null default now(),
  reviewed_at timestamp with time zone,
  reviewer_id uuid references users(id)
);

create table if not exists merchants_performance (
  merchant_id uuid primary key references merchants(id) on delete cascade,
  acceptance_rate numeric(5,2) default 0,
  cancellation_rate numeric(5,2) default 0,
  average_prep_time interval default '0 seconds',
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table if not exists riders (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null unique references users(id) on delete cascade,
  rider_code text not null unique,
  status text not null default 'pending',
  rating numeric(3,2) default 0,
  completed_deliveries int default 0,
  experience_level text default 'novice',
  approved_at timestamp with time zone,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table if not exists rider_documents (
  id uuid primary key default uuid_generate_v4(),
  rider_id uuid not null references riders(id) on delete cascade,
  type text not null,
  file_url text not null,
  status text not null default 'pending',
  submitted_at timestamp with time zone not null default now(),
  reviewed_at timestamp with time zone,
  reviewer_id uuid references users(id)
);

create table if not exists rider_vehicles (
  id uuid primary key default uuid_generate_v4(),
  rider_id uuid not null references riders(id) on delete cascade,
  make text,
  model text,
  plate_number text,
  vehicle_type text,
  capacity int default 1,
  registration_document_url text,
  status text not null default 'pending',
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table if not exists rider_performance (
  rider_id uuid primary key references riders(id) on delete cascade,
  on_time_rate numeric(5,2) default 0,
  delivery_acceptance_rate numeric(5,2) default 0,
  cancellation_count int default 0,
  incidents_reported int default 0,
  latest_score numeric(5,2) default 0,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table if not exists rider_daily_stats (
  rider_id uuid not null references riders(id) on delete cascade,
  stat_date date not null,
  cancellations int default 0,
  deliveries_completed int default 0,
  earnings_cents bigint default 0,
  primary key (rider_id, stat_date)
);

-- Geospatial support ----------------------------------------------------------
create table if not exists locations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  address text not null,
  latitude numeric(9,6) not null,
  longitude numeric(9,6) not null,
  zone text,
  type text not null default 'delivery',
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table if not exists zones (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  description text,
  geojson jsonb,
  is_active boolean not null default true,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table if not exists addresses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  label text,
  line1 text not null,
  line2 text,
  city text not null,
  state text not null,
  postal_code text,
  country text not null default 'Nigeria',
  latitude numeric(9,6),
  longitude numeric(9,6),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

-- Order and delivery model -----------------------------------------------------
create table if not exists order_statuses (
  id serial primary key,
  code text not null unique,
  label text not null,
  is_final boolean not null default false,
  sort_order int not null default 100
);

insert into order_statuses(code, label, is_final, sort_order) values
  ('pending','Pending', false, 10),
  ('confirmed','Confirmed', false, 20),
  ('preparing','Preparing', false, 30),
  ('ready','Ready', false, 40),
  ('assigned','Assigned', false, 50),
  ('delivering','Delivering', false, 60),
  ('delivered','Delivered', true, 70),
  ('cancelled','Cancelled', true, 80),
  ('declined','Declined', true, 90)
  on conflict do nothing;

create table if not exists orders (
  id uuid primary key default uuid_generate_v4(),
  order_code text not null unique,
  customer_id uuid not null references customers(id) on delete restrict,
  merchant_id uuid not null references merchants(id) on delete restrict,
  rider_id uuid references riders(id) on delete set null,
  status text not null references order_statuses(code),
  payment_method text not null,
  payment_status text not null default 'pending',
  total_amount_cents bigint not null,
  delivery_fee_cents bigint not null default 0,
  commission_cents bigint not null default 0,
  service_fee_cents bigint not null default 0,
  merchant_earnings_cents bigint not null default 0,
  destination_address_id uuid references addresses(id),
  pickup_address_id uuid references addresses(id),
  zone text,
  route_summary text,
  eta timestamp with time zone,
  scheduled_pickup_at timestamp with time zone,
  scheduled_delivery_at timestamp with time zone,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  cancelled_reason text,
  cancelled_by text,
  metadata jsonb default '{}'::jsonb
);

create index if not exists idx_orders_customer_status on orders(customer_id, status);
create index if not exists idx_orders_merchant_status on orders(merchant_id, status);
create index if not exists idx_orders_rider_status on orders(rider_id, status);
create index if not exists idx_orders_zone_status on orders(zone, status);

create table if not exists order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id) on delete cascade,
  product_name text not null,
  quantity int not null,
  unit_price_cents bigint not null,
  subtotal_cents bigint not null,
  metadata jsonb default '{}'::jsonb
);

create table if not exists deliveries (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null unique references orders(id) on delete cascade,
  rider_id uuid references riders(id) on delete set null,
  status text not null default 'pending',
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  pickup_at timestamp with time zone,
  delivered_at timestamp with time zone,
  cancelled_at timestamp with time zone,
  failure_reason text,
  current_latitude numeric(9,6),
  current_longitude numeric(9,6),
  last_update_at timestamp with time zone,
  route_geometry jsonb,
  battery_percent int,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table if not exists delivery_tracking (
  id uuid primary key default uuid_generate_v4(),
  delivery_id uuid not null references deliveries(id) on delete cascade,
  recorded_at timestamp with time zone not null default now(),
  latitude numeric(9,6) not null,
  longitude numeric(9,6) not null,
  heading numeric(5,2),
  speed numeric(5,2),
  accuracy numeric(5,2),
  status text,
  note text,
  metadata jsonb default '{}'::jsonb
);

create index if not exists idx_delivery_tracking_delivery_recorded_at on delivery_tracking(delivery_id, recorded_at desc);

create table if not exists delivery_incidents (
  id uuid primary key default uuid_generate_v4(),
  delivery_id uuid not null references deliveries(id) on delete cascade,
  reported_by uuid references users(id),
  severity text not null default 'medium',
  category text not null,
  description text not null,
  created_at timestamp with time zone not null default now(),
  resolved_at timestamp with time zone,
  resolved_by uuid references users(id),
  metadata jsonb default '{}'::jsonb
);

-- Wallet and finance ----------------------------------------------------------
create table if not exists wallets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null unique references users(id) on delete cascade,
  balance_cents bigint not null default 0,
  currency text not null default 'NGN',
  updated_at timestamp with time zone not null default now(),
  created_at timestamp with time zone not null default now()
);

create table if not exists wallet_transactions (
  id uuid primary key default uuid_generate_v4(),
  wallet_id uuid not null references wallets(id) on delete cascade,
  amount_cents bigint not null,
  type text not null,
  method text not null,
  description text,
  status text not null default 'completed',
  balance_after_cents bigint,
  order_id uuid references orders(id),
  created_at timestamp with time zone not null default now()
);

create table if not exists settlements (
  id uuid primary key default uuid_generate_v4(),
  target_id uuid not null,
  target_type text not null,
  period_start date not null,
  period_end date not null,
  total_amount_cents bigint not null,
  fees_cents bigint not null default 0,
  net_amount_cents bigint not null,
  status text not null default 'pending',
  processed_at timestamp with time zone,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create index if not exists idx_settlements_target_type_id on settlements(target_type, target_id);

create table if not exists settlement_items (
  id uuid primary key default uuid_generate_v4(),
  settlement_id uuid not null references settlements(id) on delete cascade,
  order_id uuid references orders(id),
  amount_cents bigint not null,
  fees_cents bigint not null default 0,
  net_amount_cents bigint not null,
  metadata jsonb default '{}'::jsonb
);

create table if not exists commissions (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null unique references orders(id) on delete cascade,
  merchant_commission_cents bigint not null,
  platform_commission_cents bigint not null,
  rider_commission_cents bigint not null,
  created_at timestamp with time zone not null default now()
);

create table if not exists service_fees (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null unique references orders(id) on delete cascade,
  fee_type text not null,
  amount_cents bigint not null,
  created_at timestamp with time zone not null default now()
);

-- Reviews, ratings, and loyalty ------------------------------------------------
create table if not exists ratings (
  id uuid primary key default uuid_generate_v4(),
  target_id uuid not null,
  target_type text not null,
  user_id uuid not null references users(id) on delete cascade,
  score numeric(3,2) not null,
  comment text,
  order_id uuid references orders(id),
  created_at timestamp with time zone not null default now()
);

create table if not exists reviews (
  id uuid primary key default uuid_generate_v4(),
  rating_id uuid not null references ratings(id) on delete cascade,
  status text not null default 'published',
  moderated_by uuid references users(id),
  moderated_at timestamp with time zone,
  metadata jsonb default '{}'::jsonb
);

-- Notifications and support ---------------------------------------------------
create table if not exists notification_types (
  id serial primary key,
  code text not null unique,
  category text not null,
  template jsonb
);

create table if not exists notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  title text not null,
  body text not null,
  type text not null,
  icon text,
  data jsonb default '{}'::jsonb,
  channel text not null default 'in_app',
  is_read boolean not null default false,
  sent_at timestamp with time zone,
  created_at timestamp with time zone not null default now()
);

create index if not exists idx_notifications_user_created_at on notifications(user_id, created_at desc);

create table if not exists notification_preferences (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  type text not null,
  channel text not null,
  enabled boolean not null default true,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  unique(user_id, type, channel)
);

create table if not exists support_tickets (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid not null references customers(id) on delete cascade,
  merchant_id uuid references merchants(id),
  rider_id uuid references riders(id),
  subject text not null,
  status text not null default 'open',
  priority text not null default 'medium',
  channel text not null default 'app',
  assigned_agent_id uuid references users(id),
  escalated_at timestamp with time zone,
  resolved_at timestamp with time zone,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table if not exists support_messages (
  id uuid primary key default uuid_generate_v4(),
  ticket_id uuid not null references support_tickets(id) on delete cascade,
  author_id uuid not null references users(id) on delete cascade,
  body text not null,
  is_internal boolean not null default false,
  created_at timestamp with time zone not null default now()
);

create table if not exists escalations (
  id uuid primary key default uuid_generate_v4(),
  ticket_id uuid not null references support_tickets(id) on delete cascade,
  escalated_by uuid not null references users(id),
  reason text not null,
  level text not null default 'first_line',
  status text not null default 'pending',
  created_at timestamp with time zone not null default now(),
  resolved_at timestamp with time zone
);

-- Audit and fraud -------------------------------------------------------------
create table if not exists audit_logs (
  id uuid primary key default uuid_generate_v4(),
  actor_id uuid references users(id),
  actor_role text,
  action text not null,
  target_type text,
  target_id uuid,
  ip_address inet,
  user_agent text,
  changes jsonb,
  created_at timestamp with time zone not null default now()
);

create table if not exists admin_actions (
  id uuid primary key default uuid_generate_v4(),
  admin_id uuid not null references users(id) on delete cascade,
  action text not null,
  target_type text,
  target_id uuid,
  details jsonb default '{}'::jsonb,
  created_at timestamp with time zone not null default now()
);

create table if not exists fraud_reports (
  id uuid primary key default uuid_generate_v4(),
  reporter_id uuid references users(id),
  reported_account_id uuid references users(id),
  report_type text not null,
  status text not null default 'investigating',
  score numeric(5,2) default 0,
  details text,
  evidence jsonb default '{}'::jsonb,
  created_at timestamp with time zone not null default now(),
  resolved_at timestamp with time zone,
  resolved_by uuid references users(id)
);

create table if not exists payment_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id),
  order_id uuid references orders(id),
  payment_provider text,
  provider_transaction_id text,
  amount_cents bigint not null,
  currency text not null default 'NGN',
  status text not null,
  details jsonb default '{}'::jsonb,
  created_at timestamp with time zone not null default now()
);

create table if not exists analytics_events (
  id uuid primary key default uuid_generate_v4(),
  event_name text not null,
  user_id uuid references users(id),
  role text,
  context jsonb default '{}'::jsonb,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone not null default now()
);

-- Views and helpers -----------------------------------------------------------
create view if not exists v_active_orders as
select o.id,
       o.order_code,
       o.status,
       o.customer_id,
       o.merchant_id,
       o.rider_id,
       o.total_amount_cents,
       o.delivery_fee_cents,
       o.created_at,
       o.updated_at
from orders o
where o.status not in ('delivered','cancelled','declined');

create view if not exists v_rider_workload as
select r.id as rider_id,
       r.rider_code,
       count(o.id) filter (where o.status in ('assigned','delivering')) as active_deliveries,
       sum(o.total_amount_cents) filter (where o.status in ('assigned','delivering')) as active_value_cents
from riders r
left join orders o on o.rider_id = r.id
group by r.id;

-- Trigger helpers ------------------------------------------------------------
create function update_timestamp() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger users_updated_at before update on users for each row execute function update_timestamp();
create trigger customers_updated_at before update on customers for each row execute function update_timestamp();
create trigger merchants_updated_at before update on merchants for each row execute function update_timestamp();
create trigger riders_updated_at before update on riders for each row execute function update_timestamp();
create trigger orders_updated_at before update on orders for each row execute function update_timestamp();
create trigger deliveries_updated_at before update on deliveries for each row execute function update_timestamp();
create trigger wallets_updated_at before update on wallets for each row execute function update_timestamp();

-- Sample Role Definitions ----------------------------------------------------
insert into roles(slug, name, description) values
  ('customer','Customer','End-user of the delivery service'),
  ('rider','Rider','Delivery partner and field operator'),
  ('merchant','Merchant','Order source and store operator'),
  ('support_agent','Support Agent','Customer and partner support operator'),
  ('operations_manager','Operations Manager','Dispatch and control room operator'),
  ('finance_manager','Finance Manager','Finance and settlement operator'),
  ('admin','Admin','Platform administrator'),
  ('super_admin','Super Admin','Platform owner with emergency access')
  on conflict do nothing;

insert into permissions(code, name, category, description) values
  ('orders.view','View orders','Orders','View order details for permitted users'),
  ('orders.manage','Manage orders','Orders','Update order lifecycle and statuses'),
  ('dispatch.assign','Assign deliveries','Dispatch','Assign or reassign riders to deliveries'),
  ('wallet.view','View wallet','Finance','View wallet balances and transactions'),
  ('wallet.manage','Manage wallet','Finance','Credit/debit wallet balances and refunds'),
  ('users.manage','Manage users','Admin','Create or suspend user accounts'),
  ('support.view','View tickets','Support','Access support tickets and messages'),
  ('support.manage','Manage tickets','Support','Resolve or escalate support tickets'),
  ('settings.manage','Manage settings','Admin','Update system settings and configuration')
  on conflict do nothing;

-- Example mapping for default platform roles. In an enterprise deployment, maintain mappings in migration scripts.
insert into role_permissions(role_id, permission_id)
select r.id, p.id
from roles r
join permissions p on p.code in ('orders.view','orders.manage','dispatch.assign','wallet.view','support.view','support.manage','settings.manage')
where r.slug in ('admin','super_admin')
  on conflict do nothing;
