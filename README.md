# Project

Simple implementation of offers-api, using Node.js + AWS (Lambda, API Gateway and DynamoDB).

To run the project, please add .env file including:

| Variables                |
| -----------              |
| AWS_ACCESS_KEY_ID        |
| AWS_SECRET_ACCESS_KEY    |
| AWS_REGION               |
| OFFERS_DYNAMODB_TABLE    |
| LOCATIONS_DYNAMODB_TABLE |

AWS credentials and region are necessary for DynamoDB integration when running the create DB scenario script.
Table names are necessary as well since I used table names with suffix for testing purposes.

For serverless deploy, please add credentials on aws-cli too.

## Part 1 - DynamoDB creation and seeding

For this part, I created a script on setup/ called createdDbScenario. It will try to create the tables checking its existence before, and seed the DB (after tables are fully available) with an offer and 3 locations. It can be ran using "npm run create-db-scenario".

I had previous experience with DynamoDB in the past, and I see as its pros its capability of empowering developers with a powerful tool fully managed by AWS, offering fast responses without a steeping learning curve. It gives a lot of agility when developing something new.
The biggest problem comes on its cost: as you start having spikes in read or write, it's complicated to manage its provisioned throughput and not throttle. Switching to a on-demand plan can make it very expensive... So as the table starts to be overwhelmed in situations like having read/write spikes, its use could be reconsidered due to its costs.

So, considering the use case of linking one offer to one location, the most obvious choice would be to use location id and offer id as partition keys, and maybe brand id as sorting key (although it wouldn't be necessary for this specific use case). 
The issue is that this approach wouldn't be effective as we need to link all brand's locations to a single offer. That would demand to use scans and this is not a good practice since it checks the whole table and demands a lot of reading capacity. For this reason, I used brand id as partition key and offer id/location id as sorting key. That demands an extra field (brand id) while linking an offer to a location but covers better both use cases described. 

## Part 2 - Lambda 

To deploy the created lambda, please make sure you have aws-cli with configured credentials. I didn't setup proper a IAM user due to the timeframe (this whole project was developed in less than 3 days), so I used my personal's account root user. It can be deployed with "sls deploy".

I worked previously with AWS Lambda and serverless in the past, but I hadn't setup it from scratch. I was familiar with serverless.yml and its structure beforehand, so there weren't much surprises during development.

As we work with functions which update different tables, it's important to understand how critical is the changes we are dealing and how they impact our data consistency. For this use case, we update one location and then increment atomically one offer, guaranteeing that they both exist beforehand. If the first operation succeeds, the second much likely will, and as we keep track of the offers per location, even if the second one fails it's not complicated to fix its counter. Something that would be good to implement in case we have multiple updates in a single location concurrently is to add a version field, and then the update will include a condition that only updates if the received version matches current one, retrying as it doesn't match.

The expected payload for this function is {offerId, locationId, brandId}, which are also checked if they are valid UUIDs, and the response is always a message of what happened. 

I also implemented tests with Jest, which can be ran with "npm run test".

## Bonus part

Due to lack of time which I would take to implement the bonus part, I will describe my proposed solution:

As I mentioned before, I designed the tables keys considering also this second use case. There are some points to be considered on this problem: are costs an issue? Because this use case of updating 10k locations at once will create a write spike and, if the table uses provisioned throughput, it might throttle. If costs are not an issue, using an on demand plan (and making sure we have enough concurrency limit and/or execution time limit for the lambda that will do the job) might be able to solve it.

In real life, where costs are an issue and we are sticking with DynamoDB, an interesting solution is to have an specific endpoint/lambda that will be responsible for creating a "link an offer to all brand's locations" job. 
This lambda would create a job (which could be an item in a jobs table, so we can keep track of this job steps). This job would create X messages in a SQS queue, which would be further consumed by a reserved lambda (so it's concurrency limit doesn't impact other functionalities). This way we could guarantee that the table wouldn't throttle because of it, and on each step we could keep track of how is it going so the customer could check through some endpoint or even some webhook. 

So, basically, the biggest challenge in this is to handle a write spike in DynamoDB, and to make it more cost effective it would be nice to make this whole process asynchronous from customer's perspective and implement this job functionality so things could be done in small steps and be easy to monitor/recover from failure.
