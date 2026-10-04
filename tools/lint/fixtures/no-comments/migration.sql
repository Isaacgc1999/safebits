select '-- not a comment', 'it''s fine';
-- a line comment
create function f() returns int language sql as $$
  select 1 /* inside a body */;
$$;
