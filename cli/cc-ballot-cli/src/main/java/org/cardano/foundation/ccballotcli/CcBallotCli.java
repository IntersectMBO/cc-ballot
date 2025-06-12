package org.cardano.foundation.ccballotcli;

import org.cardano.foundation.ccballotcli.actions.CastVote;
import org.cardano.foundation.ccballotcli.actions.ViewVoteReceipt;
import org.cardano.foundation.ccballotcli.actions.GetResults;

public class CcBallotCli {

    public static void main(String[] args) {
        if (args.length == 0) {
            printUsage();
            return;
        }

        String command = args[0];

        switch (command) {
            case "cast_vote":
                CastVote.execute(args);
                break;
            case "view_vote_receipt":
                ViewVoteReceipt.execute(args);
                break;
            case "get_results":
                GetResults.execute(args);
                break;
            default:
                System.out.println("Unknown command: " + command);
                printUsage();
        }
    }

    private static void printUsage() {
        System.out.println("\nUsage:");
        System.out.println("  cc-ballot-cli <command> [arguments]\n");

        System.out.println("Available Commands:");
        System.out.println("  cast_vote <payloadFilePath> <signature> <publicKey>");
        System.out.println("      Submit a signed vote payload.");
        System.out.println("      Example:");
        System.out.println("        cc-ballot-cli cast_vote payload.json ABC123SIGN PUBLICKEYXYZ\n");

        System.out.println("  view_vote_receipt <payloadFilePath> <signature> <publicKey>");
        System.out.println("      Retrieve a vote receipt using your signed payload.");
        System.out.println("      Example:");
        System.out.println("        cc-ballot-cli view_vote_receipt payload.json ABC123SIGN PUBLICKEYXYZ\n");

        System.out.println("  get_results");
        System.out.println("      Fetch the election results.");
        System.out.println("      Example:");
        System.out.println("        cc-ballot-cli get_results\n");

        System.out.println("To configure the app, edit the config.properties file inside the distribution.");
    }

}
