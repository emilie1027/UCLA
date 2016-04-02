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
    exit(3);
}

int main(int argc, char *argv[]) {
    
    char *infile = malloc(BUF_SIZE);
    char *outfile = malloc(BUF_SIZE);
    
    static struct option options[] = {
        {"input", required_argument, NULL, INPUT},
        {"output", required_argument, NULL, OUTPUT},
        {"segfault", no_argument, NULL, SEGFAULT},
        {"catch", no_argument, NULL, CATCH},
        {0,0,0,0}
    };
    
    int ret = 0;
    while ((ret = getopt_long(argc, argv, "", options, NULL)) != -1) {
        //fprintf(stderr, "ret: %c, optind: %d, optarg: %s\n", ret, optind, optarg);
        
        switch(ret) {
            case SEGFAULT:
            {
                char *bug = NULL;
                *bug = 'c';
                break;
            }
            case CATCH:
            {
                signal(SIGSEGV, signal_handler);
                break;
            }
            case INPUT:
            {
                infile = optarg;
                break;
            }
            case OUTPUT:
            {
                outfile = optarg;
                break;
            }
            default:
                break;
        }
    }
    int fd0, fd1;
    char *buffer = malloc(BUF_SIZE);
    if ((fd0 = open(infile, O_RDONLY)) < 0) {
        perror("failed to open input");
        exit(1);
    }
    else {
        close(0);
        dup2(0, fd0);
        close(fd0);
    }
    
    if ((fd1 = creat(outfile, 0666)) < 0) {
        perror("failed to open output");
        exit(2);
    }
    else {
        close(1);
        dup(fd1);
        close(fd1);
    }
    
    int n;
    while((n = read(0, buffer, BUF_SIZE)) > 0) {
        write(1, buffer, n);
    }
    close(0);
    close(1);
    free(buffer);
    exit(0);
}

