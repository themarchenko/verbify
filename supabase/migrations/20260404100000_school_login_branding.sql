-- Add login page branding fields to schools
alter table schools add column login_heading text;
alter table schools add column login_subheading text;
