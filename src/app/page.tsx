import SteamAPI from "steamapi";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Progress } from "~/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { env } from "~/env";

const Home = async () => {
  const steam = new SteamAPI(env.STEAM_API_KEY);

  const games = await steam.getUserOwnedGames(env.STEAM_ID);

  const gamesWithAchievements = (
    await Promise.all(
      games.map(async (game) => {
        try {
          const achievements = await steam.getUserAchievements(
            env.STEAM_ID,
            game.game.id,
          );
          // TODO: use the game schema to get the achievement names and descriptions
          // const schema = await steam.getGameSchema(game.game.id);
          return {
            ...game,
            achievements: {
              ...achievements,
              percentage:
                (achievements.achievements.filter(
                  (achievement) => achievement.unlocked,
                ).length /
                  achievements.achievements.length) *
                100,
              numCompleted: achievements.achievements.filter(
                (achievement) => achievement.unlocked,
              ).length,
            },
          };
        } catch (error) {
          return { ...game, achievements: null };
        }
      }),
    )
  )
    .filter((game) => game.achievements !== null)
    .sort((a, b) => {
      if (a.achievements!.percentage > b.achievements!.percentage) {
        return -1;
      }
      if (a.achievements!.percentage < b.achievements!.percentage) {
        return 1;
      }
      return 0;
    });

  // get number of completed games, number of started games, and number of unstarted games and average completion percentage
  const completedGames = gamesWithAchievements.filter(
    (game) => game.achievements!.percentage === 100,
  ).length;
  const startedGames = gamesWithAchievements.filter(
    (game) => game.achievements!.percentage > 0,
  ).length;
  const unstartedGames = gamesWithAchievements.filter(
    (game) => game.achievements!.percentage === 0,
  ).length;
  const averageCompletion =
    gamesWithAchievements.reduce(
      (acc, game) => acc + game.achievements!.percentage,
      0,
    ) / gamesWithAchievements.length;
  const averageCompletionWithoutUnstarted =
    gamesWithAchievements.reduce(
      (acc, game) =>
        game.achievements!.percentage === 0
          ? acc
          : acc + game.achievements!.percentage,
      0,
    ) /
    gamesWithAchievements.filter((game) => game.achievements!.percentage !== 0)
      .length;

  return (
    <div className="flex">
      <div className="mx-auto max-w-sm">
        <div className="m-2 text-center">
          <h1 className="text-4xl font-bold">Steam Achievements</h1>
          <p>
            A tracker for my percentage completion of achievements on my Steam
            games. I have {completedGames} completed games, {startedGames}{" "}
            started games, and {unstartedGames} unstarted games with an average
            completion of {averageCompletion.toFixed(2)}% including unstarted
            games and {averageCompletionWithoutUnstarted.toFixed(2)}% without
            unstarted games.
          </p>
        </div>
        <Accordion type="single" collapsible>
          {gamesWithAchievements.map((game, i) => (
            <AccordionItem
              key={game.game.id}
              value={`item-${i}`}
              className="m-4 w-full"
            >
              <AccordionTrigger className="flex w-full">
                <div className="flex w-full flex-grow flex-col pr-2 text-left">
                  <div className="flex space-x-2">
                    <Avatar className="my-auto">
                      <AvatarImage src={game.game.coverURL} />
                      <AvatarFallback>
                        {game.achievements!.game.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <h1 className="my-auto font-bold">
                      {game.achievements!.game}
                    </h1>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                {game.achievements!.achievements.map((achievement, i) => (
                  <div key={i} className="m-2">
                    <div
                      className={
                        achievement.unlocked
                          ? "text-primary"
                          : "text-destructive"
                      }
                    >
                      {achievement.name}
                    </div>
                  </div>
                ))}
              </AccordionContent>
              <Progress
                className="mt-2"
                value={game.achievements!.percentage}
                text={`${game.achievements!.numCompleted} / ${game.achievements!.achievements.length}`}
              />
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
};

export default Home;
