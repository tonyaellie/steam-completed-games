import SteamAPI from "steamapi";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Progress } from "~/components/ui/progress";
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
        <div className="text-center">
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
        {gamesWithAchievements.map((game) => (
          <div key={game.game.id} className="m-4 space-y-2">
            <div className="flex space-x-2">
              <Avatar className="my-auto">
                <AvatarImage src={game.game.coverURL} />
                <AvatarFallback>
                  {game.achievements!.game.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h1 className="my-auto font-bold">{game.achievements!.game}</h1>
            </div>
            <Progress value={game.achievements!.percentage} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
