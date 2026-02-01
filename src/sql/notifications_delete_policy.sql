-- Add Delete policy for notifications
create policy "Admins can delete notifications" 
  on public.notifications 
  for delete 
  using (auth.role() = 'authenticated');
