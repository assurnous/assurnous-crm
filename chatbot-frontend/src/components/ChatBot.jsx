// import React, { useState } from 'react';

// const Chatbot = () => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [messages, setMessages] = useState([]);
//   const [questionIndex, setQuestionIndex] = useState(0);
//   const [isTyping, setIsTyping] = useState(false);
//   const [userResponses, setUserResponses] = useState([]);
//   const [userText, setUserText] = useState('');
//   const [showButton, setShowButton] = useState(true);
//   const [showCloseButton, setShowCloseButton] = useState(false);
//   const [showImageOnly, setShowImageOnly] = useState(false);

//   const conversation = [
//     {
//       question: 'Bonjour ! Comment puis-je vous aider aujourd\'hui ?',
//       responses: [
//         'Nous avons déjà discuté ensemble 🙂',
//         'Oui',
//         'Non, re-bonjour',
//       ],
//     },
//     {
//       question: 'Vous êtes là pour...',
//       responses: [
//         'Je te renseigne ?',
//         'Poser une question ?',
//         'Être contacté',
//       ],
//     },
//     {
//       question: 'Quel programme vous intéresse ?',
//       responses: [
//         'Programmes de premier cycle',
//         'Programmes de deuxième cycle',
//         'Master',
//         'Autre',
//       ],
//     },
//     {
//       question: 'Où en es-tu dans tes études ?',
//       responses: [
//         'Collège 🎒',
//         'Lycée 📚',
//         'Université 🎓',
//         'Autre',
//       ],
//     },
//     {
//       question: 'Quel est ton dernier diplôme obtenu ?',
//       responses: [
//         'BEP',
//         'Baccalauréat',
//         'Licence',
//         'Master',
//         'Autre',
//       ],
//     },
//     {
//       question: 'Puis-je connaître ton prénom ?',
//       responses: [
//         'Bien sûr !',
//         'Pas maintenant',
//       ],
//     },
//   ];

//   const finalResponse = (name) => {
//     return `Merci ${name ? name : 'pour vos réponses'} ! Voici le lien pour plus d’informations sur le Master : [Lien vers le Master](https://example.com/master)`;
//   };

//   const toggleChatbot = () => {
//     setIsOpen(!isOpen);
//     if (!isOpen) {
//       // Reset states when opening the chatbot
//       setMessages([]);
//       setQuestionIndex(0);
//       setUserResponses([]);
//       startConversation();
//       setShowButton(false);
//       setShowCloseButton(true);
//       setShowImageOnly(false);
//     }
//   };

//   const startConversation = () => {
//     const { question } = conversation[questionIndex];
//     setMessages([{ sender: 'Chatbot', text: question }]);
//   };

//   const handleResponseClick = (response) => {
//     setMessages((prev) => [
//       ...prev,
//       { sender: 'User', text: response },
//     ]);

//     // Store user responses
//     setUserResponses((prev) => [...prev, response]);

//     processNextQuestion();
//   };

//   const handleTextSubmit = (e) => {
//     e.preventDefault(); // Prevent default form submission behavior
//     if (userText.trim()) {
//       setMessages((prev) => [
//         ...prev,
//         { sender: 'User', text: userText },
//       ]);
//       setUserResponses((prev) => [...prev, userText]);
//       setUserText(''); // Clear input field
//       setIsTyping(true);
//       processNextQuestion();
//     }
//   };

//   const processNextQuestion = () => {
//     setIsTyping(true);
//     setTimeout(() => {
//       setMessages((prev) => [
//         ...prev,
//         { sender: 'Chatbot', text: 'D\'accord !' },
//       ]);

//       setTimeout(() => {
//         const nextQuestionIndex = questionIndex + 1;

//         if (nextQuestionIndex < conversation.length) {
//           const { question } = conversation[nextQuestionIndex];
//           setMessages((prev) => [
//             ...prev,
//             { sender: 'Chatbot', text: question },
//           ]);
//           setQuestionIndex(nextQuestionIndex);
//         } else {
//           const nameResponse = userResponses[userResponses.length - 1];
//           setMessages((prev) => [
//             ...prev,
//             { sender: 'Chatbot', text: finalResponse(nameResponse) },
//           ]);
//           setIsOpen(false);
//         }
//         setIsTyping(false);
//       }, 3000);
//     }, 1000);
//   };

//   const handleCloseChatbot = () => {
//     setShowImageOnly(true);
//     setShowButton(false);
//     setIsOpen(false);
//     // Reset states to ensure proper re-opening
//     setShowCloseButton(false);
//     setMessages([]);
//     setUserResponses([]);
//     setQuestionIndex(0);
//   };

//   const handleImageClick = () => {
//     setShowImageOnly(false);
//     setShowButton(false);
//     setIsOpen(true);
//     startConversation();
//     setShowCloseButton(true); // Ensure close button is visible on reopen
//   };

//   return (
//     <div>
//       {!showImageOnly && showButton && (
//         <button
//           onClick={toggleChatbot}
//           className="fixed bottom-5 right-5 bg-white text-black p-4 rounded-lg shadow-lg flex flex-col items-center"
//         >
//           <img
//             src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
//             alt="Chatbot"
//             className="w-12 h-12 rounded-full mb-2"
//           />
//           <div className="text-center text-sm">
//             <div>Hello 👋, Dispo pour chatter ? 😃</div>
//             <div className="mt-1 bg-blue-500 text-white py-1 px-2 rounded">
//               oui, lancer la conversation
//             </div>
//           </div>
//         </button>
//       )}

//       {showImageOnly && (
//         <div className="fixed bottom-5 right-5">
//           <img
//             onClick={handleImageClick}
//             src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
//             alt="Chatbot"
//             className="w-12 h-12 rounded-full cursor-pointer"
//           />
//         </div>
//       )}

//       {isOpen && (
//         <div className="fixed bottom-20 right-5 w-80 bg-white shadow-lg rounded-lg p-6 z-50">
//           <h2 className="text-lg font-bold mb-2">Chatbot</h2>
//           <div className="h-64 overflow-y-auto mb-2 border border-gray-300 rounded-lg p-6">
//             {messages.map((message, index) => (
//               <div key={index} className={`mb-2 flex ${message.sender === 'Chatbot' ? 'justify-start' : 'justify-end'}`}>
//                 <div className={`p-2 rounded-lg ${message.sender === 'Chatbot' ? 'bg-gray-200 text-sm' : 'bg-blue-500 text-white text-sm'}`}>
//                   {message.sender === 'Chatbot' ? (
//                     <div className="flex items-center">
//                       <img src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png" alt="Chatbot" className="w-8 h-8 rounded-full mr-2" />
//                       <strong>{message.text}</strong>
//                     </div>
//                   ) : (
//                     <strong>{message.text}</strong>
//                   )}
//                 </div>
//               </div>
//             ))}
//             {isTyping && (
//               <div className="mb-2 flex justify-start">
//                 <div className="p-2 rounded-lg bg-gray-200 text-sm">
//                   <strong>...</strong>
//                 </div>
//               </div>
//             )}
//             {/* Display response buttons on the right side */}
//             {questionIndex < conversation.length && !isTyping && (
//               <div className="flex flex-col items-end mt-2">
//                 {conversation[questionIndex].responses.map((response) => (
//                   <button
//                     key={response}
//                     onClick={() => handleResponseClick(response)}
//                     className="bg-blue-500 text-white py-1 px-3 rounded mb-1"
//                   >
//                     {response}
//                   </button>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* User text input field */}
//           {isOpen && !isTyping && (
//             <form onSubmit={handleTextSubmit} className="mt-2">
//               <input
//                 type="text"
//                 value={userText}
//                 onChange={(e) => setUserText(e.target.value)}
//                 placeholder="Écrivez votre message ici..."
//                 className="border border-gray-300 rounded-lg py-1 px-2 w-full"
//               />
//               <button type="submit" className="bg-blue-500 text-white py-1 px-4 rounded ml-1">
//                 Envoyer
//               </button>
//             </form>
//           )}

//           {showCloseButton && (
//             <button
//               onClick={handleCloseChatbot}
//               className="bg-red-500 text-white py-1 bottom-5 right-5 px-4 rounded mt-2"
//             >
//               Fermer
//             </button>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default Chatbot;
import React, { useState } from 'react';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [userResponses, setUserResponses] = useState([]);
  const [userText, setUserText] = useState('');
  const [showButton, setShowButton] = useState(true);
  const [showCloseButton, setShowCloseButton] = useState(false);
  const [showImageOnly, setShowImageOnly] = useState(false);

  const conversation = [
    {
      question: 'Bonjour ! Comment puis-je vous aider aujourd\'hui ?',
      responses: [
        'Nous avons déjà discuté ensemble 🙂',
        'Oui',
        'Non, re-bonjour',
      ],
    },
    {
      question: 'Vous êtes là pour...',
      responses: [
        'Je te renseigne ?',
        'Poser une question ?',
        'Être contacté',
      ],
    },
    {
      question: 'Quel programme vous intéresse ?',
      responses: [
        'Programmes de premier cycle',
        'Programmes de deuxième cycle',
        'Master',
        'Autre',
      ],
    },
    {
      question: 'Où en es-tu dans tes études ?',
      responses: [
        'Collège 🎒',
        'Lycée 📚',
        'Université 🎓',
        'Autre',
      ],
    },
    {
      question: 'Quel est ton dernier diplôme obtenu ?',
      responses: [
        'BEP',
        'Baccalauréat',
        'Licence',
        'Master',
        'Autre',
      ],
    },
    {
      question: 'Puis-je connaître ton prénom ?',
      responses: [
        'Bien sûr !',
        'Pas maintenant',
      ],
    },
  ];

  const finalResponse = (name) => {
    return `Merci ${name ? name : 'pour vos réponses'} ! Voici le lien pour plus d’informations sur le Master : [Lien vers le Master](https://example.com/master)`;
  };

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Reset states when opening the chatbot
      setMessages([]);
      setQuestionIndex(0);
      setUserResponses([]);
      startConversation();
      setShowButton(false);
      setShowCloseButton(true);
      setShowImageOnly(false);
    }
  };

  const startConversation = () => {
    const { question } = conversation[questionIndex];
    setMessages([{ sender: 'Chatbot', text: question }]);
  };

  const handleResponseClick = (response) => {
    setMessages((prev) => [
      ...prev,
      { sender: 'User', text: response },
    ]);

    // Store user responses
    setUserResponses((prev) => [...prev, response]);

    processNextQuestion();
  };

  const handleTextSubmit = (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    if (userText.trim()) {
      setMessages((prev) => [
        ...prev,
        { sender: 'User', text: userText },
      ]);
      setUserResponses((prev) => [...prev, userText]);
      setUserText(''); // Clear input field
      setIsTyping(true);
      processNextQuestion();
    }
  };

  const processNextQuestion = () => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { sender: 'Chatbot', text: 'D\'accord !' },
      ]);

      setTimeout(() => {
        const nextQuestionIndex = questionIndex + 1;

        if (nextQuestionIndex < conversation.length) {
          const { question } = conversation[nextQuestionIndex];
          setMessages((prev) => [
            ...prev,
            { sender: 'Chatbot', text: question },
          ]);
          setQuestionIndex(nextQuestionIndex);
        } else {
          const nameResponse = userResponses[userResponses.length - 1];
          setMessages((prev) => [
            ...prev,
            { sender: 'Chatbot', text: finalResponse(nameResponse) },
          ]);
          setIsOpen(false);
        }
        setIsTyping(false);
      }, 3000);
    }, 1000);
  };

  const handleCloseChatbot = () => {
    setShowImageOnly(true);
    setShowButton(false);
    setIsOpen(false);
    // Reset states to ensure proper re-opening
    setShowCloseButton(false);
    setMessages([]);
    setUserResponses([]);
    setQuestionIndex(0);
  };

  const handleImageClick = () => {
    setShowImageOnly(false);
    setShowButton(false);
    setIsOpen(true);
    startConversation();
    setShowCloseButton(true); // Ensure close button is visible on reopen
  };

  return (
    <div>
      {!showImageOnly && showButton && (
        <button
          onClick={toggleChatbot}
          className="fixed bottom-5 right-5 bg-gray-200 text-black p-4 rounded-lg shadow-lg flex flex-col items-center"
        >
          <img
            src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
            alt="Chatbot"
            className="w-12 h-12 rounded-full mb-2"
          />
          <div className="text-center text-sm">
            <div>Hello 👋, Dispo pour chatter ? 😃</div>
            <div className="mt-1 bg-blue-500 text-white py-1 px-2 rounded">
              oui, lancer la conversation
            </div>
          </div>
        </button>
      )}

      {showImageOnly && (
        <div className="fixed bottom-5 right-5">
          <img
            onClick={handleImageClick}
            src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
            alt="Chatbot"
            className="w-12 h-12 rounded-full cursor-pointer"
          />
        </div>
      )}

      {isOpen && (
        <div className="fixed bottom-20 right-5 w-80 bg-white shadow-lg rounded-lg p-6 flex flex-col">
          <h2 className="text-lg font-bold mb-2">Chatbot</h2>
          <div className="h-70 overflow-y-auto mb-2 border border-gray-300 rounded-lg p-6 flex-1">
            {messages.map((message, index) => (
              <div key={index} className={`mb-2 flex ${message.sender === 'Chatbot' ? 'justify-start' : 'justify-end'}`}>
                <div className={`p-2 rounded-lg ${message.sender === 'Chatbot' ? 'bg-gray-200 text-sm' : 'bg-blue-500 text-white text-sm'}`}>
                  {message.sender === 'Chatbot' ? (
                    <div className="flex items-center">
                      <img src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png" alt="Chatbot" className="w-8 h-8 rounded-full mr-2" />
                      <strong>{message.text}</strong>
                    </div>
                  ) : (
                    <strong>{message.text}</strong>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="mb-2 flex justify-start">
                <div className="p-2 rounded-lg bg-gray-200 text-sm">
                  <strong>...</strong>
                </div>
              </div>
            )}
            {/* Display response buttons on the right side */}
            {questionIndex < conversation.length && !isTyping && (
              <div className="flex flex-col items-end mt-2">
                {conversation[questionIndex].responses.map((response) => (
                  <button
                    key={response}
                    onClick={() => handleResponseClick(response)}
                    className="bg-blue-500 text-white py-1 px-3 rounded mb-1"
                  >
                    {response}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User text input field */}
          {isOpen && !isTyping && (
            <form onSubmit={handleTextSubmit} className="mt-2">
              <input
                type="text"
                value={userText}
                onChange={(e) => setUserText(e.target.value)}
                placeholder="Écrivez votre message ici..."
                className="border border-gray-300 rounded-lg py-1 px-2 w-full"
              />
              <button type="submit" className="bg-blue-500 text-white py-1 px-4 rounded ml-1">
                Envoyer
              </button>
            </form>
          )}
          {/* Close button at the bottom corner of the conversation area */}
          {showCloseButton && (
            <button
              onClick={handleCloseChatbot}
              className="mt-2 bg-red-500 text-white py-1 px-4 rounded absolute bottom-5 right-5"
            >
              Fermer
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Chatbot;
