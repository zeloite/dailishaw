-- Add DELETE policy for expenses so users can delete their own expenses

-- Users can delete their own expenses
create policy "Users can delete their own expenses"
  on expenses for delete
  using (user_id = auth.uid());
