-- Function to increment user points
CREATE OR REPLACE FUNCTION increment_points(user_id UUID, point_value INT)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_points INT;
BEGIN
    -- Update the user's points and return the new value
    UPDATE users
    SET points = COALESCE(points, 0) + point_value
    WHERE id = user_id
    RETURNING points INTO new_points;
    
    -- Return the new points total
    RETURN new_points;
END;
$$; 