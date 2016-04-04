#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <fcntl.h>
#include <signal.h>
#include <errno.h>
#include <getopt.h>

#define BUF_SIZE 8192
#define INPUT 'i'
#define OUTPUT 'o'
#define SEGFAULT 's'
#define CATCH 'c'

void signal_handler(int signum) {
    signal(SIGSEGV, signal_handler);
    fprintf(stderr, "Caught SIGSEGV\n");
    _exit(3);
}

int main(int argc, char *argv[]) {
    
    static struct option options[] = {
        {"input", required_argument, NULL, INPUT},
        {"output", required_argument, NULL, OUTPUT},
        {"segfault", no_argument, NULL, SEGFAULT},
        {"catch", no_argument, NULL, CATCH},
        {0,0,0,0}
    };
    
    int ret = 0;
    int fault = 0;
    while ((ret = getopt_long(argc, argv, "", options, NULL)) != -1) {
//        fprintf(stderr, "ret: %c, optind: %d, optarg: %s\n", ret, optind, optarg);
        
        switch(ret) {
            case SEGFAULT:
            {
                fault = 1;
                break;
            }
            case CATCH:
            {
                signal(SIGSEGV, signal_handler);
                break;
            }
            case INPUT:
            {
                int fd0;
                if ((fd0 = open(optarg, O_RDONLY)) < 0) {
                    perror("failed to open input");
                    _exit(1);
                }
                else {
                    /*
                     close(0);
                     dup(fd0);
                     close(fd0);
                     */
                    dup2(fd0,0);
                    close(fd0);
                }
                break;
            }
            case OUTPUT:
            {
                int fd1;
                if ((fd1 = creat(optarg, 0666)) < 0) {
                    perror("failed to open output");
                    _exit(2);
                }
                else {
                    /*
                     close(1);
                     dup(fd1);
                     close(fd1);
                     */
                    dup2(fd1,1);
                    close(fd1);
                }
                break;
            }
            default:
                _exit(4);
        }
    }
    if (fault) {
        char *bug = NULL;
        *bug = 'c';
    }
    char *buffer = malloc(BUF_SIZE);
    int n;
    while((n = read(0, buffer, BUF_SIZE)) > 0) {
        write(1, buffer, n);
    }
    close(0);
    close(1);
    free(buffer);
    _exit(0);
}

