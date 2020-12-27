import React, { useState } from "react";
import { gql, useQuery, useMutation } from "@apollo/client";

const GET_USERS = gql`
  query GET_USERS {
    users {
      _id
      firstName
      lastName
    }
  }
`;

const UPDATE_USER = gql`
  mutation UPDATE_USER($_id: ID!, $lastName: String!) {
    updateUser(_id: $_id, lastName: $lastName) {
      _id
    }
  }
`;

const Main = (props) => {
  const [lastName, updateLastName] = useState("");
  const { loading, error, data } = useQuery(GET_USERS);
  const [updateUser] = useMutation(UPDATE_USER, {
    refetchQueries: [{ query: GET_USERS }]
  });

  const updateName = (evt) => {
    updateLastName(evt.target.value);
  };

  const handleChange = (userId) => {
    updateUser({ variables: { _id: userId, lastName } });
  };

  if (loading) return <p>Loading...</p>;
  if (error) return `Error: ${error}`;
  return (
    <>
      <ul>
        {data.users.map((user) => (
          <li key={user._id}>
            {user.firstName} {user.lastName}
          </li>
        ))}
      </ul>
      <div>
        Change last name for {data.users[0].firstName}:{" "}
        <input type="text" value={lastName} onChange={updateName} />
        <button onClick={() => handleChange(data.users[0]._id)}>Change</button>
      </div>
    </>
  );
};

export default Main;
