// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { Spin, Table, Alert, Select, Button } from "antd";
// import { MailOutlined, MessageOutlined } from "@ant-design/icons";

// const MagicSms = () => {
//   const [chatData, setChatData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [pageSize, setPageSize] = useState(10);
//   const [showSpinner, setShowSpinner] = useState(false);
//   const [selectedLeads, setSelectedLeads] = useState([]);
//   const [selectedPhone, setSelectedPhone] = useState(null); // To store the selected phone number
//   const [conversation, setConversation] = useState([]); // To store the conversation history
//   const [message, setMessage] = useState("");
//   const [chatVisible, setChatVisible] = useState(false);

//   useEffect(() => {
//     // Fetch conversation history when a phone number is selected
//     const fetchConversation = async () => {
//       if (selectedPhone) {
//         try {
//           const response = await axios.get(`/conversation/${selectedPhone}`);
//           setConversation(response.data.conversationHistory || []); // Store conversation
//         } catch (err) {
//           console.error("Error fetching conversation:", err);
//         }
//       }
//     };

//     fetchConversation();
//   }, [selectedPhone]);

 
//   const handleSendMessage = async (e) => {
//     e.preventDefault();

//     if (message.trim()) {
//       setLoading(true);
//       setConversation([...conversation, { sender: "user", message }]); // Add user message to conversation
//       setMessage("");

//       try {
//         // Extract `request_phone` from `selectedPhone`
//         const request_phone = selectedPhone.request_phone;

//         if (!request_phone) {
//           console.error("Selected phone does not contain 'request_phone'.");
//           return;
//         }

//         // Send user message to backend
//         const response = await axios.post("/send-sms", {
//           request_phone,
//           message,
//         });

//         console.log("Response:", response.data);

//         // Get AI response
//         const aiResponse = await getAIResponse(message);
//         setConversation((prev) => [
//           ...prev,
//           { sender: "ai", message: aiResponse }, // Add AI response to conversation
//         ]);
//       } catch (err) {
//         console.error(
//           "Error sending message:",
//           err.response?.data || err.message
//         );
//       } finally {
//         setLoading(false);
//       }
//     }
//   };

//   const getAIResponse = async (userMessage) => {
//     // Get AI response for the user message
//     const response = await axios.post("/ai-response", {
//       message: userMessage,
//     });
//     return response.data.aiResponse;
//   };

//   const handlePageChange = (value) => {
//     setCurrentPage(value);
//   };
//   const totalPages = Math.ceil(chatData.length / pageSize);

//   useEffect(() => {
//     const getUserData = async () => {
//       try {
//         const response = await axios.get("/data");
//         console.log("Fetched data:", response.data);
//         setChatData(response.data.chatData);
//       } catch (err) {
//         setError("Failed to fetch data");
//       } finally {
//         setLoading(false);
//       }
//     };

//     getUserData();
//   }, []);

  // const columns = [
  //   {
  //     title: "Prénom",
  //     key: "request_lastname",
  //     dataIndex: "request_lastname",
  //     render: (text, record) => (
  //       <div
  //         className="cursor-pointer"
  //         onClick={() => handleCoachClick(record)}
  //       >
  //         <div>{record.request_lastname || "-"}</div>
  //       </div>
  //     ),
  //   },
  //   {
  //     title: "Nom",
  //     key: "request_name",
  //     dataIndex: "request_name",
  //     render: (text, record) => (
  //       <div
  //         className="cursor-pointer"
  //         onClick={() => handleCoachClick(record)}
  //       >
  //         <div>{record.request_name || "-"}</div>
  //       </div>
  //     ),
  //   },

  //   {
  //     title: "Email",
  //     key: "request_email" || "request_add_email",
  //     dataIndex: "request_email" || "request_add_email",
  //     render: (text, record) => (
  //       <div
  //         className="cursor-pointer"
  //         onClick={() => handleCoachClick(record)}
  //       >
  //         <div className="text-gray-500 text-xs">
  //           {record.verification_email === "Non"
  //             ? record.request_add_email || "-"
  //             : record.request_email || "-"}
  //         </div>
  //       </div>
  //     ),
  //   },
  //   {
  //     title: "DATE",
  //     dataIndex: "createdAt",
  //     key: "createdAt",
  //     render: (date) => {
  //       if (!date) return "-";
  //       const formattedDate = new Date(date);
  //       const day = formattedDate.toLocaleDateString("en-GB");
  //       const time = formattedDate.toLocaleTimeString("en-US", {
  //         hour: "2-digit",
  //         minute: "2-digit",
  //       });
  //       return (
  //         <div
  //           className="cursor-pointer"
  //           onClick={() => handleCoachClick(record)}
  //         >
  //           <div>{day}</div>
  //           <div className="text-gray-500 text-sm">{time}</div>
  //         </div>
  //       );
  //     },
  //   },
  //   {
  //     title: "TELEPHONE",
  //     dataIndex: "request_phone",
  //     key: "request_phone",
  //     render: (text) => text || "-",
  //   },
  //   {
  //     title: "Status",
  //     dataIndex: "course_details",
  //     key: "course_details",
  //     render: (text, record) => text || record.request_who || "-",
  //   },
  //   {
  //     title: "SMS",
  //     key: "send_sms",
  //     render: (_, record) => (
  //       <Button
  //         type="primary"
  //         icon={<MessageOutlined />}
  //         onClick={() => setSelectedPhone(record)}
  //       />
  //     ),
  //   },
  // ];

//   if (loading && showSpinner) return <Spin tip="Loading..." />;

//   if (error)
//     return <Alert message="Error" description={error} type="error" showIcon />;
//   const rowSelection = {
//     onChange: (selectedRowKeys) => {
//       setSelectedLeads(selectedRowKeys);
//     },
//     selectedRowKeys: selectedLeads,
//   };

//   return (
//     <div className=" bg-gray-50 h-full mb-6 rounded-md">
//       <div className="mb-4 p-4 flex items-center rounded-md gap-4">
//         <span className="font-thin text-gray-600">Afficher</span>
//         <Select
//           defaultValue={1}
//           onChange={handlePageChange}
//           className="w-20 border-gray-300"
//         >
//           {[...Array(totalPages)].map((_, index) => (
//             <Option key={index + 1} value={index + 1}>
//               {index + 1}
//             </Option>
//           ))}
//         </Select>

//         <span className="font-thin text-gray-600">résultats par page</span>
//       </div>

//       <div className="bg-white rounded-lg shadow-md p-4 mb-12">
        // <Table
        //   dataSource={chatData.slice(
        //     (currentPage - 1) * pageSize,
        //     currentPage * pageSize
        //   )}
        //   columns={[
        //     ...columns.map((col) => ({
        //       ...col,
        //       title: (
        //         <div className="flex flex-col items-center">
        //           <div className="text-xs">{col.title}</div>
        //         </div>
        //       ),
        //     })),
        //   ]}
        //   rowKey={(record) => record._id}
        //   pagination={false}
        //   bordered
        //   className="custom-table"
        //   rowSelection={rowSelection}
        //   tableLayout="fixed"
        // />
//       </div>
//       {selectedPhone && (
//         <div className="bg-white rounded-lg shadow-md p-4 mb-12">
//           <div className="flex bg-gray-500 flex-col p-6 rounded-lg shadow-md w-full max-w-lg mx-auto">
//             <h3 className="text-2xl font-semibold border rounded-lg text-center mb-4">
//               Chat avec {selectedPhone.request_lastname}
//             </h3>

//             <div className="space-y-4 mb-6 h-80 overflow-y-auto px-2">
//               {conversation.length === 0 ? (
//                 <p className="text-gray-500">
//                   No conversation yet. Start chatting!
//                 </p>
//               ) : (
//                 conversation.map((msg, index) => (
//                   <div
//                     key={index}
//                     className={`p-2 rounded-lg max-w-[200px] ${
//                       msg.sender === "user"
//                           ? "justify-end bg-blue-200 text-xs"
//           : "justify-start text-sm items-center"
//                     }`}
//                   >
//                     <p className="text-gray-700">{msg.message}</p>
//                   </div>
//                 ))
//               )}
//             </div>

          
//             <div className="flex justify-between items-center bg-blue-500 text-white p-2 rounded-t-lg">
//           <h3>Chat</h3>
//           <button onClick={() => setChatVisible(false)}>&times;</button>
//         </div>
//         <div className="p-4 max-h-80 overflow-y-auto">
//           {conversation.map((msg, index) => (
//             <div
//               key={index}
//               className={`p-2 rounded-md ${
//                 msg.sender === "user" ? "bg-blue-100 text-right" : "bg-gray-100"
//               }`}
//             >
//               {msg.message}
//             </div>
//           ))}
//         </div>
//             <form
//           onSubmit={handleSendMessage}
//           className="flex p-2 border-t items-center"
//         >
//           <input
//             type="text"
//             value={message}
//             onChange={(e) => setMessage(e.target.value)}
//             className="flex-grow p-2 border rounded-md"
//             placeholder="Type a message..."
//           />
//           <button type="submit" className="bg-blue-500 text-white px-4 ml-2 rounded-md">
//             Send
//           </button>
//         </form>
//             <button
//         onClick={() => setChatVisible(!chatVisible)}
//         className="fixed bottom-4 right-4 bg-blue-500 text-white p-4 rounded-full shadow-lg"
//       >
//         <MessageOutlined />
//       </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default MagicSms;



import React, { useEffect, useState } from "react";
import axios from "axios";
import { Spin, Table, Alert, Select, Button } from "antd";
import { MessageOutlined } from "@ant-design/icons";

const MagicSms = () => {
  const [chatData, setChatData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedPhone, setSelectedPhone] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [message, setMessage] = useState("");
  const [chatVisible, setChatVisible] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState([]);

  useEffect(() => {
    const fetchConversation = async () => {
      if (selectedPhone) {
        try {
          const response = await axios.get(`/conversation/${selectedPhone.request_phone}`);
          const history = response.data.conversationHistory || [];
          setConversation(history); // Ensures it's an array
        } catch (err) {
          console.error("Error fetching conversation:", err);
          setConversation([]); // Fallback to an empty array
        } finally {
          setChatVisible(true); // Show chat only after trying to fetch the conversation
        }
      }
    };
  
    fetchConversation();
  }, [selectedPhone]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (message.trim()) {
      setConversation([...conversation, { sender: "user", message }]);
      setMessage("");

      try {
        await axios.post("/send-sms", {
          request_phone: selectedPhone.request_phone,
          message,
        });
      } catch (err) {
        console.error("Error sending message:", err.response?.data || err.message);
      }
    }
  };

  const handlePageChange = (value) => {
    setCurrentPage(value);
  };
    const rowSelection = {
    onChange: (selectedRowKeys) => {
      setSelectedLeads(selectedRowKeys);
    },
    selectedRowKeys: selectedLeads,
  };


  useEffect(() => {
    const getUserData = async () => {
      try {
        const response = await axios.get("/data");
        setChatData(response.data.chatData);
      } catch (err) {
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    getUserData();
  }, []);
  const columns = [
    {
      title: "Prénom",
      key: "request_lastname",
      dataIndex: "request_lastname",
      render: (text, record) => (
        <div
          className="cursor-pointer"
          onClick={() => handleCoachClick(record)}
        >
          <div>{record.request_lastname || "-"}</div>
        </div>
      ),
    },
    {
      title: "Nom",
      key: "request_name",
      dataIndex: "request_name",
      render: (text, record) => (
        <div
          className="cursor-pointer"
          onClick={() => handleCoachClick(record)}
        >
          <div>{record.request_name || "-"}</div>
        </div>
      ),
    },

    {
      title: "Email",
      key: "request_email" || "request_add_email",
      dataIndex: "request_email" || "request_add_email",
      render: (text, record) => (
        <div
          className="cursor-pointer"
          onClick={() => handleCoachClick(record)}
        >
          <div className="text-gray-500 text-xs">
            {record.verification_email === "Non"
              ? record.request_add_email || "-"
              : record.request_email || "-"}
          </div>
        </div>
      ),
    },
    {
      title: "DATE",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => {
        if (!date) return "-";
        const formattedDate = new Date(date);
        const day = formattedDate.toLocaleDateString("en-GB");
        const time = formattedDate.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        });
        return (
          <div
            className="cursor-pointer"
            onClick={() => handleCoachClick(record)}
          >
            <div>{day}</div>
            <div className="text-gray-500 text-sm">{time}</div>
          </div>
        );
      },
    },
    {
      title: "TELEPHONE",
      dataIndex: "request_phone",
      key: "request_phone",
      render: (text) => text || "-",
    },
    {
      title: "Status",
      dataIndex: "course_details",
      key: "course_details",
      render: (text, record) => text || record.request_who || "-",
    },
    {
      title: "SMS",
      key: "send_sms",
      render: (_, record) => (
        <Button
          type="primary"
          icon={<MessageOutlined />}
          onClick={() => setSelectedPhone(record)}
        />
      ),
    },
  ];

  if (loading) return <Spin tip="Loading..." />;
  if (error) return <Alert message="Error" description={error} type="error" showIcon />;

  return (
    <div className="bg-gray-50 h-full mb-6 rounded-md">
      <div className="bg-white rounded-lg shadow-md p-4 mb-12">
      <Table
          dataSource={chatData.slice(
            (currentPage - 1) * pageSize,
            currentPage * pageSize
          )}
          columns={[
            ...columns.map((col) => ({
              ...col,
              title: (
                <div className="flex flex-col items-center">
                  <div className="text-xs">{col.title}</div>
                </div>
              ),
            })),
          ]}
          rowKey={(record) => record._id}
          pagination={false}
          bordered
          className="custom-table"
          rowSelection={rowSelection}
          tableLayout="fixed"
        />
      </div>

      {chatVisible && (
        <div className="fixed bottom-4 right-4 bg-white border rounded-lg shadow-lg w-80 p-4">
          <div className="flex justify-between w-full items-center bg-blue-500 text-white p-2 rounded-t-lg">
            <h3>Chat avec {selectedPhone?.request_lastname}</h3>
            <button onClick={() => setChatVisible(false)}>&times;</button>
          </div>
          <div className="h-[336px] w-full overflow-y-auto flex flex-col px-2">
          {conversation.length > 0 ? (
        conversation.map((msg, index) => (
          <div
            key={index}
            // className={`p-2 max-w-xs text-xs rounded-lg ${
            //  msg.sender === "user" ? "bg-blue-100 text-left mt-2" : "bg-gray-100 text-right"
            // }`}
            className={`p-2 max-w-xs mt-6 text-xs rounded-lg ${
              msg.sender === "user"
                ? "text-black font-semibold text-sm"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            {msg.message}
          </div>
        ))
      ) : (
        <div className="text-gray-500 text-center mt-16">
         Pas encore de conversation. Envoyez le premier message !
        </div>
      )}
          </div>
          <form onSubmit={handleSendMessage} className="flex p-2 border-t items-center">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-grow p-2 border rounded-md"
              placeholder="Type a message..."
            />
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 ml-2 rounded-md">
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default MagicSms;
