export default function MessageSearchBar({
  setSearchBar,
  searchUsers,
  handleUserClick,
  curUserId,
}) {
  return (
    <>
      <div>
        <input
          placeholder="Search Users"
          onChange={(e) => setSearchBar(e.target.value)}
        ></input>
        <div>
          <ul>
            {searchUsers.length === 0 ? (
              <li>No Users Found</li>
            ) : (
              searchUsers.map((user) => (
                <li
                  key={user.username}
                  onClick={() => handleUserClick(curUserId, user.user_id)}
                >
                  {user.username}
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </>
  );
}
