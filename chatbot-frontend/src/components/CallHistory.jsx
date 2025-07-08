import React, { useState } from "react";

const CallHistory = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [conversationDetails, setConversationDetails] = useState(null);
  const [currentPage, setCurrentPage] = useState(1); // Track current page
  const conversationsPerPage = 10; // Number of conversations per page

  // Function to fetch all conversations
  const fetchAllConversations = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        "https://api.elevenlabs.io/v1/convai/conversations",
        {
          method: "GET",
          headers: {
            "xi-api-key": "sk_7ea9ce9dd90fc58f3922f09d80a198d0ee7572894b4ea8d5", // Replace with your xi-api-key
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch conversations");
      }

      const data = await response.json();
      setConversations(data.conversations); // Assuming the API response contains 'conversations' key
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch conversation details by conversation_id
  const fetchConversationDetails = async (conversationId) => {
    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/convai/conversations/${conversationId}`,
        {
          method: "GET",
          headers: {
            "xi-api-key": "sk_7ea9ce9dd90fc58f3922f09d80a198d0ee7572894b4ea8d5", // Replace with your xi-api-key
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch details for conversation ID ${conversationId}`
        );
      }

      const data = await response.json();
      setConversationDetails(data); // Store the details of the specific conversation
    } catch (err) {
      console.error(
        `Error fetching details for conversation ${conversationId}:`,
        err
      );
    }
  };

  // Function to handle button click to load conversations
  const handleButtonClick = () => {
    fetchAllConversations();
  };

  const indexOfLastConversation = currentPage * conversationsPerPage;
  const indexOfFirstConversation =
    indexOfLastConversation - conversationsPerPage;
  const currentConversations = conversations.slice(
    indexOfFirstConversation,
    indexOfLastConversation
  );

  // Handle loading state and error display
  if (loading) {
    return <div className="text-center text-xl">Loading conversations...</div>;
  }

  if (error) {
    return (
      <div className="text-center text-xl text-red-500">Error: {error}</div>
    );
  }

  const handleNextPage = () => {
    if (currentPage * conversationsPerPage < conversations.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-6">
        <button
          onClick={handleButtonClick}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none"
        >
          Load All Conversations
        </button>
      </div>

      {conversations.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Conversation List
          </h2>
          <ul className="space-y-4">
            {currentConversations.map((conversation) => (
              <li
                key={conversation.conversation_id}
                className="flex justify-between items-center p-4 bg-gray-50 border border-gray-200 rounded-lg shadow-sm hover:bg-gray-100"
              >
                <span className="text-gray-700 font-medium">
                  {conversation.conversation_id}
                </span>
                <button
                  onClick={() =>
                    fetchConversationDetails(conversation.conversation_id)
                  }
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none"
                >
                  View Details
                </button>
              </li>
            ))}
          </ul>
          {/* Pagination controls */}
          <div className="flex justify-between mt-6">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-300 text-gray-600 rounded-lg cursor-pointer disabled:opacity-50"
            >
              Previous
            </button>
            <span className="flex items-center text-gray-700">
              Page {currentPage} of{" "}
              {Math.ceil(conversations.length / conversationsPerPage)}
            </span>
            <button
              onClick={handleNextPage}
              disabled={
                currentPage * conversationsPerPage >= conversations.length
              }
              className="px-4 py-2 bg-gray-300 text-gray-600 rounded-lg cursor-pointer disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {conversationDetails && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Conversation Details
          </h2>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <ul className="space-y-4">
              {conversationDetails.transcript.map((entry, index) => (
                <li key={index} className="flex flex-col space-y-2">
                  <div className="font-semibold text-blue-600">
                    {entry.role === "agent" ? "Agent" : "User"}
                  </div>
                  <div className="text-gray-800">{entry.message}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default CallHistory;
