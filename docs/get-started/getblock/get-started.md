| Id          |Sidebar_position  |Title                     |Sidebar_label |Description|image|
|--           |--                |--                        |--         |--|--|
|get-started  | 2                |Get started with GetBlock |Get started|Get started with GetBlock| /builder-tools/getblock.png|

 # Login/Sign-up
In order to use the [GetBlock Cardano Endpoints]([https://getblock.io/nodes/ada/](https://getblock.io/nodes/ada/)), you need to [create an account first]([https://account.getblock.io/sign-in](https://account.getblock.io/sign-in)), you can do it via email or use a Web3 wallet.
 
![img](https://storage.getblock.io/web/blog/article-images/img1+(2).png)

The Cardano API endpoint by GetBlock is a useful tool for early-stage teams that want to take advantage of Cardano's benefits.

Now Navigate to the dashboard and click on the "endpoint" tab.  
# Create Cardano Endpoint
Create a new endpoint by selecting Cardano as the blockchain network and clicking the "get" button.
Copy the endpoint to use it in the API requests.

![img](https://storage.getblock.io/web/blog/article-images/Screenshot+2023-06-07+at+15.19.58.png)

Use a tool like cURL to make requests to the Cardano network. For example, to get the status of the Cardano mainnet, run the following command:
```
curl https://ada.getblock.io/mainnet/network/status \ 
--header 'Content-Type: application/json' \
--header 'x-api-key: YOUR-API-KEY' \
--data '{
	"network_identifier": {
	"blockchain": "cardano",
	"network": "mainnet"
	},
	"metadata": {}
}'
```

Make sure to replace `YOUR-API-KEY` with the API key you obtained in step 4.

The response will contain information about the current block, the genesis block, and peers on the Cardano network.

That's it! You can now use GetBlock to make requests to the Cardano blockchain network.

If you have any additional questions or would like to share your experience, feel free to join our [community of Web3 developers]([https://discord.gg/Jb9UZZUHN7](https://discord.gg/Jb9UZZUHN7)) who are always ready to chat.
<!--stackedit_data:
eyJoaXN0b3J5IjpbMTc3MTc1NzkzMF19
-->