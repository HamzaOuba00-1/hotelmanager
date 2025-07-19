import React from "react";

const ClientLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
	return (
		<div>
			{children}
		</div>
	);
};

export default ClientLayout;
