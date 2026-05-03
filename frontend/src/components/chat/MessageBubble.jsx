export const MessageBubble = ({ message, isOwn }) => {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[70%] px-4 py-2 rounded-2xl ${isOwn ? 'bg-primary-gold text-dark-base' : 'bg-dark-elevated text-white'}`}>
        {!isOwn && <p className="text-xs text-gray-400 mb-1">{message.sender?.name || 'Helper'}</p>}
        <p>{message.message}</p>
        <p className={`text-xs mt-1 ${isOwn ? 'text-dark-base/70' : 'text-gray-400'}`}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  )
}
