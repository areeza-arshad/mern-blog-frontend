const NoDataMessage  = ({ message }) => {
  return (
    <div>
      <div className="text-center w-full p-4 rounded-full bg-grey/50 mt-4">
          <p>{message}</p>
      </div>    
    </div>
  )
}

export default NoDataMessage;
